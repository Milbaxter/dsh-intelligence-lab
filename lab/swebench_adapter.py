#!/usr/bin/env python3
"""SWE-bench Lite adapter for the DSH plugin lab.

Dry-run scoring lives in TypeScript. This script is the live path:

1. Resolve a fixed instance split (lite50 / lite100 / lite / dev).
2. For each instance, check out the SWE-bench repo at the base commit,
   run DeepSeek Harness with the composed plugin overlay, and capture `git diff`.
3. Write predictions.jsonl and call `swebench.harness.run_evaluation`.

It refuses to invent scores when dependencies or credentials are missing.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SPLITS = DATA / "splits"


def main() -> int:
    parser = argparse.ArgumentParser(description="SWE-bench adapter for DSH Plugin Lab")
    parser.add_argument("--score", help="JSON payload from the TypeScript loop")
    parser.add_argument("--prepare-split", choices=["lite50", "lite100", "lite", "dev"])
    parser.add_argument("--smoke", action="store_true", help="Print environment readiness")
    args = parser.parse_args()

    if args.smoke:
        print(json.dumps(smoke(), indent=2))
        return 0
    if args.prepare_split:
        print(json.dumps(prepare_split(args.prepare_split), indent=2))
        return 0
    if args.score:
        payload = json.loads(args.score)
        print(json.dumps(score(payload), indent=2))
        return 0

    parser.print_help()
    return 1


def smoke() -> dict:
    return {
        "python": sys.version,
        "swebench": _module_ok("swebench"),
        "datasets": _module_ok("datasets"),
        "deepseek_harness": _module_ok("deepseek_harness"),
        "docker": _which("docker"),
        "dsh": _which("dsh"),
        "eval_model": os.environ.get("DSH_MODEL", "deepseek-v4-flash"),
        "api_key_present": bool(os.environ.get("DEEPSEEK_API_KEY")),
        "note": (
            "Live scoring needs DeepSeek credentials, Docker, swebench, and "
            "deepseek-harness-sdk. Until then the dashboard loop uses dry-run."
        ),
    }


def prepare_split(name: str) -> dict:
    SPLITS.mkdir(parents=True, exist_ok=True)
    try:
        from datasets import load_dataset
    except ImportError as exc:
        raise SystemExit(
            "Install datasets and swebench to prepare a live split: "
            "pip install datasets swebench"
        ) from exc

    split = "dev" if name == "dev" else "test"
    ds = load_dataset("princeton-nlp/SWE-bench_Lite", split=split)
    ids = sorted(ds["instance_id"])
    take = {"lite50": 50, "lite100": 100, "lite": 300, "dev": 23}[name]
    chosen = ids[:take] if name != "lite" else ids
    if name in {"lite50", "lite100"}:
        # Stable strided sample so we keep repo diversity instead of the first N django tasks.
        step = max(1, len(ids) // take)
        chosen = [ids[i] for i in range(0, len(ids), step)][:take]
    out = SPLITS / f"{name}.json"
    out.write_text(json.dumps({"name": name, "instance_ids": chosen}, indent=2) + "\n")
    return {"path": str(out), "count": len(chosen)}


CHEAP_EVAL_MODELS = {"deepseek-v4-flash", "deepseek-chat"}


def score(payload: dict) -> dict:
    model = payload.get("model", "deepseek-v4-flash")
    if model not in CHEAP_EVAL_MODELS:
        raise SystemExit(
            f"Eval model {model!r} is not cheap. "
            f"Benchmarks must use one of {sorted(CHEAP_EVAL_MODELS)}."
        )
    os.environ["DSH_MODEL"] = model
    os.environ.setdefault("DSH_SYSTEM_PROMPT", "You are a cheap, fast software engineer. Fix the issue with the smallest patch. Do not refactor.")
    ready = smoke()
    missing = [
        name
        for name, ok in {
            "swebench": ready["swebench"],
            "deepseek_harness": ready["deepseek_harness"],
            "docker": ready["docker"],
            "api_key": ready["api_key_present"],
        }.items()
        if not ok
    ]
    if missing:
        raise SystemExit(
            "Live SWE-bench scoring is not ready. Missing: "
            + ", ".join(missing)
            + ". Run `python3 lab/swebench_adapter.py --smoke`."
        )

    instance_ids = _instance_ids(payload.get("split", "lite50"))
    rows = _rows()
    run_dir = DATA / "runs" / payload["setup_id"] / f"seed-{payload['seed']}"
    run_dir.mkdir(parents=True, exist_ok=True)
    predictions_path = run_dir / "predictions.jsonl"
    dsh_home = DATA / "runs" / payload["setup_id"] / "dsh-home"
    _install_plugins(payload, dsh_home)

    from deepseek_harness import DeepSeekHarness

    predictions: list[dict] = []
    for instance_id in instance_ids:
        workspace = run_dir / "workspaces" / instance_id
        workspace.mkdir(parents=True, exist_ok=True)
        _materialize_instance(instance_id, workspace, rows)
        prompt = _prompt_for(instance_id, workspace, rows)
        patch_file = DATA / "runs" / payload["setup_id"] / "cordis.patch.yml"
        with DeepSeekHarness(
            provider="deepseek-official",
            model=model,
            cwd=str(workspace),
            dsh_home=str(dsh_home),
            profile=payload.get("profile", "headless"),
            patches=(str(patch_file),) if patch_file.exists() else (),
        ) as harness:
            harness.run(prompt, session_id=f"{payload['setup_id']}-{instance_id}")
        diff = subprocess.check_output(["git", "diff"], cwd=workspace, text=True)
        predictions.append(
            {
                "instance_id": instance_id,
                "model_name_or_path": model,
                "model_patch": diff,
            }
        )

    with predictions_path.open("w") as handle:
        for row in predictions:
            handle.write(json.dumps(row) + "\n")

    eval_out = _run_swebench_eval(predictions_path, payload)
    resolved = int(eval_out.get("resolved", 0))
    total = int(eval_out.get("total", len(instance_ids)))
    return {
        "seed": payload["seed"],
        "resolved": resolved,
        "total": total,
        "resolveRate": resolved / total if total else 0.0,
        "durationMs": int(eval_out.get("duration_ms", 0)),
        "predictionPath": str(predictions_path),
        "logPath": str(run_dir / "eval.json"),
    }


def _instance_ids(split: str) -> list[str]:
    path = SPLITS / f"{split}.json"
    if not path.exists():
        prepare_split(split)
    return json.loads(path.read_text())["instance_ids"]


_ROWS: dict[str, dict] | None = None


def _rows() -> dict[str, dict]:
    global _ROWS
    if _ROWS is not None:
        return _ROWS
    from datasets import load_dataset

    test = load_dataset("princeton-nlp/SWE-bench_Lite", split="test")
    dev = load_dataset("princeton-nlp/SWE-bench_Lite", split="dev")
    _ROWS = {row["instance_id"]: row for row in list(test) + list(dev)}
    return _ROWS


def _install_plugins(payload: dict, dsh_home: Path) -> None:
    dsh_home.mkdir(parents=True, exist_ok=True)
    marker = dsh_home / ".plugins-installed"
    if marker.exists():
        return
    setup_path = DATA / "runs" / payload["setup_id"] / "setup.json"
    specs: list[str] = []
    if setup_path.exists():
        specs = [
            spec
            for spec in json.loads(setup_path.read_text()).get("installSpecs", [])
            if not spec.startswith("idea:")
        ]
    env = {**os.environ, "DSH_HOME": str(dsh_home)}
    profile = payload.get("profile", "headless")
    subprocess.check_call(["dsh", f"--profile", profile, "--dump-default-config"], env=env)
    for spec in specs:
        subprocess.check_call(
            ["dsh", "plugin", "--profile", profile, "add", spec],
            env=env,
        )
    marker.write_text("\n".join(specs) + "\n")


def _materialize_instance(instance_id: str, workspace: Path, rows: dict[str, dict]) -> None:
    row = rows.get(instance_id)
    if row is None:
        raise SystemExit(f"Unknown SWE-bench instance {instance_id}")

    repo_url = f"https://github.com/{row['repo']}.git"
    if not (workspace / ".git").exists():
        subprocess.check_call(["git", "clone", "--quiet", repo_url, str(workspace)])
    subprocess.check_call(["git", "fetch", "--quiet"], cwd=workspace)
    subprocess.check_call(["git", "checkout", "--force", "--quiet", row["base_commit"]], cwd=workspace)


def _prompt_for(instance_id: str, workspace: Path, rows: dict[str, dict]) -> str:
    row = rows.get(instance_id)
    if not row:
        return f"Fix SWE-bench instance {instance_id} in {workspace}."
    return (
        "You are fixing a real GitHub issue. Stay in this checkout. "
        "Reproduce the failing tests, make the smallest patch, and re-run the tests.\n\n"
        f"Repository: {row['repo']}\n"
        f"Instance: {row['instance_id']}\n\n"
        f"{row['problem_statement']}\n"
    )


def _run_swebench_eval(predictions_path: Path, payload: dict) -> dict:
    run_id = f"{payload['setup_id']}-s{payload['seed']}"
    cmd = [
        sys.executable,
        "-m",
        "swebench.harness.run_evaluation",
        "--dataset_name",
        payload.get("dataset", "princeton-nlp/SWE-bench_Lite"),
        "--predictions_path",
        str(predictions_path),
        "--run_id",
        run_id,
        "--max_workers",
        os.environ.get("SWEBENCH_WORKERS", "4"),
    ]
    completed = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
    log = {
        "cmd": cmd,
        "returncode": completed.returncode,
        "stdout": completed.stdout[-8000:],
        "stderr": completed.stderr[-8000:],
    }
    (predictions_path.parent / "eval.json").write_text(json.dumps(log, indent=2))
    if completed.returncode != 0:
        raise SystemExit(completed.stderr or completed.stdout or "swebench evaluation failed")

    # Official reports write <run_id>.json next to the predictions or in the cwd.
    for candidate in Path.cwd().glob(f"*{run_id}*.json"):
        try:
            data = json.loads(candidate.read_text())
        except json.JSONDecodeError:
            continue
        resolved = data.get("resolved_instances") or data.get("resolved") or []
        if isinstance(resolved, list):
            return {"resolved": len(resolved), "total": data.get("total_instances", len(resolved))}
        if isinstance(resolved, int):
            return {"resolved": resolved, "total": data.get("total_instances", resolved)}
    raise SystemExit("Evaluation finished but no resolve-count JSON was found.")


def _module_ok(name: str) -> bool:
    try:
        __import__(name)
        return True
    except ImportError:
        return False


def _which(name: str) -> bool:
    from shutil import which

    return which(name) is not None


if __name__ == "__main__":
    raise SystemExit(main())
