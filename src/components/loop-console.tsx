"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, RotateCcw, FastForward, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { delta, pct, when } from "@/lib/format";
import type { LabSnapshot } from "@/lib/lab/types";

export function LoopConsole({ initial }: { initial: LabSnapshot }) {
  const router = useRouter();
  const [snap, setSnap] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const exp = snap.experiment;
  const nextId = exp.queue[0];
  const nextPlugin = snap.catalog.find((p) => p.id === nextId);
  const simulated = exp.config.mode === "dry";
  const running = pending || exp.status === "running";

  async function refresh() {
    const res = await fetch("/api/lab", { cache: "no-store" });
    setSnap(await res.json());
    router.refresh();
  }

  useEffect(() => {
    if (exp.status !== "running") return;
    const timer = setInterval(() => {
      void refresh();
    }, 1500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp.status]);

  async function step(steps: number, detach = false) {
    setError(null);
    start(async () => {
      const res = await fetch("/api/lab/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps,
          mode: exp.config.mode,
          detach: detach || exp.config.mode === "live" || steps > 1,
        }),
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      await refresh();
    });
  }

  async function reset() {
    setError(null);
    start(async () => {
      await fetch("/api/lab/reset", { method: "POST" });
      await refresh();
    });
  }

  async function stop() {
    await fetch("/api/lab/stop", { method: "POST" });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Autonomous search</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Greedy plugin loop</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Default DSH plugins first. One candidate at a time, three cheap-model repeats.
            Keep only if the mean clears the noise floor. Every {exp.config.metaEvery} plugins
            a review reorders the queue and can ablate a kept plugin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void step(1)} disabled={running}>
            <Play />
            {exp.championScore ? "Test next" : "Run baseline"}
          </Button>
          <Button variant="outline" onClick={() => void step(6, true)} disabled={running}>
            <FastForward />
            Run 6
          </Button>
          <Button variant="outline" onClick={() => void step(200, true)} disabled={running}>
            Drain queue
          </Button>
          {exp.status === "running" ? (
            <Button variant="ghost" onClick={() => void stop()}>
              <Square />
              Stop
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => void reset()} disabled={running}>
              <RotateCcw />
              Reset
            </Button>
          )}
        </div>
      </div>

      {simulated ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          These scores are <strong>simulated</strong>. Dry-run replays catalog priors plus noise so
          the keep/drop machinery can be tested. It is not SWE-bench Lite. Switch to live on a
          Docker machine with a DeepSeek key before trusting a champion.
        </p>
      ) : !snap.readiness.ready ? (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          Live mode is on, but this machine is missing: {snap.readiness.missing.join(", ")}.
          The next step will fail until those are installed.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>
              Champion resolve rate{simulated ? " (simulated)" : ""}
            </CardDescription>
            <CardTitle className="text-3xl">{pct(exp.championScore?.meanResolveRate)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {exp.config.evalModel} · {exp.config.split} · {exp.config.repeats}× repeats · {exp.config.mode}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Kept plugins</CardDescription>
            <CardTitle className="text-3xl">{exp.championPluginIds.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {exp.championPluginIds.length === 0
              ? "Default DSH plugins only."
              : exp.championPluginIds.join(", ")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Queue remaining</CardDescription>
            <CardTitle className="text-3xl">{exp.queue.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge value={running ? "running" : exp.status} />
            {snap.worker ? <span>{snap.worker.note}</span> : <span>No worker heartbeat yet.</span>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next candidate</CardTitle>
            <CardDescription>
              {exp.championScore
                ? "Added on top of the current champion, then scored 3×."
                : "The first step measures the default plugin set alone."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!exp.championScore ? (
              <p className="text-sm">
                Baseline: official <code className="text-foreground">{exp.config.profile}</code> profile.
                No community plugins.
              </p>
            ) : nextId?.startsWith("~ablate:") ? (
              <p className="text-sm">
                Ablation: re-score the champion without{" "}
                <span className="font-medium">{nextId.slice("~ablate:".length)}</span>. If the
                score holds, that plugin was cargo and gets dropped.
              </p>
            ) : nextPlugin ? (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{nextPlugin.name}</p>
                  <StatusBadge value={nextPlugin.kind} />
                  <StatusBadge value={nextPlugin.category} />
                </div>
                <p className="text-muted-foreground">{nextPlugin.hypothesis}</p>
                <p>{nextPlugin.whyForSweBench}</p>
                {simulated ? (
                  <p className="text-xs text-amber-200">
                    Dry-run prior {nextPlugin.priorBoostPp >= 0 ? "+" : ""}
                    {nextPlugin.priorBoostPp.toFixed(1)} pp (author guess, not a measurement).
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Queue is empty. The champion is frozen.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest meta-review</CardTitle>
            <CardDescription>
              Reviews now reorder the queue and can enqueue ablations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exp.reviews.at(-1) ? (
              <div className="space-y-2 text-sm">
                <p>{exp.reviews.at(-1)?.summary}</p>
                {exp.reviews.at(-1)?.actions?.length ? (
                  <ul className="list-disc pl-4 text-muted-foreground">
                    {exp.reviews.at(-1)?.actions?.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Actions apply on the next daemon step.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No review yet. Run the loop until {exp.config.metaEvery} candidates have been judged.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {exp.trials.length === 0 ? (
        <EmptyState title="No scores yet">
          Run the baseline. In dry mode that number is simulated. In live mode it is SWE-bench Lite
          on {exp.config.evalModel}.
        </EmptyState>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exp.trials
              .slice()
              .reverse()
              .slice(0, 8)
              .map((trial) => (
                <div
                  key={trial.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/80 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={trial.decision} />
                      {trial.mode === "dry" ? <StatusBadge value="simulated" /> : null}
                      <p className="font-medium">{trial.candidateName}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{trial.reason}</p>
                  </div>
                  <div className="shrink-0 text-sm text-muted-foreground sm:text-right">
                    <p className="text-foreground">{pct(trial.candidateScore.meanResolveRate)}</p>
                    <p>{delta(trial.deltaPp)}</p>
                    <p>{when(trial.createdAt)}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
