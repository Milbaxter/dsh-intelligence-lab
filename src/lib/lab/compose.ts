import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { catalogById } from "./catalog";
import { runsDir } from "./paths";

export interface ComposedSetup {
  setupId: string;
  pluginIds: string[];
  profile: string;
  patchPath: string;
  installSpecs: string[];
  notes: string[];
}

/**
 * Compose a headless DSH profile overlay for one setup.
 * Community plugins are installed with `dsh plugin --profile <p> add <spec>`.
 * Local remixes are file: dependencies plus an insert row.
 */
export function composeSetup(
  setupId: string,
  pluginIds: string[],
  profile: string,
  cwd = process.cwd(),
  evalModel = "deepseek-v4-flash",
): ComposedSetup {
  const catalog = catalogById();
  const installSpecs: string[] = [];
  const insertRows: string[] = [];
  const notes: string[] = [];

  for (const id of pluginIds) {
    const plugin = catalog.get(id);
    if (!plugin) {
      notes.push(`Unknown plugin id ${id} — skipped in overlay.`);
      continue;
    }
    installSpecs.push(plugin.install);
    const entryId = id.replace(/[^a-zA-Z0-9_-]/g, "-");
    if (plugin.localPath) {
      insertRows.push(
        `    - id: ${entryId}\n      name: ${plugin.install}\n      config: {}\n`,
      );
    } else {
      insertRows.push(`    - id: ${entryId}\n      name: ${plugin.install}\n`);
    }
    notes.push(`${plugin.name}: ${plugin.hypothesis}`);
  }

  const dir = path.join(runsDir(cwd), setupId);
  mkdirSync(dir, { recursive: true });
  const patchPath = path.join(dir, "cordis.patch.yml");
  const yaml =
    pluginIds.length === 0
      ? "# baseline — default DeepSeek Harness profile plugins only\n"
      : `# generated overlay for ${setupId}\n- insert:\n${insertRows.join("")}`;
  writeFileSync(patchPath, yaml, "utf8");

  writeFileSync(
    path.join(dir, "setup.json"),
    `${JSON.stringify({ setupId, pluginIds, profile, installSpecs, patchPath, evalModel }, null, 2)}\n`,
    "utf8",
  );

  const installs = installSpecs
    .filter((spec) => !spec.startsWith("idea:"))
    .map((spec) => `dsh plugin --profile ${profile} add ${spec}`)
    .join("\n");
  writeFileSync(
    path.join(dir, "install.sh"),
    `#!/usr/bin/env bash\nset -euo pipefail\nexport DSH_HOME="\${DSH_HOME:?set DSH_HOME to an isolated home}"\nexport DSH_MODEL="${evalModel}"\ndsh --profile ${profile} --dump-default-config >/dev/null\n${installs}\n`,
    "utf8",
  );

  return { setupId, pluginIds, profile, patchPath, installSpecs, notes };
}
