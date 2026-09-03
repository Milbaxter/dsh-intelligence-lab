import { spawnSync } from "node:child_process";

export function commitLabData(message: string, cwd = process.cwd()): string | null {
  const add = spawnSync("git", ["add", "data"], { cwd, encoding: "utf8" });
  if (add.status !== 0) return null;
  const staged = spawnSync("git", ["diff", "--cached", "--name-only"], {
    cwd,
    encoding: "utf8",
  });
  if (!staged.stdout.trim()) return null;
  const commit = spawnSync("git", ["commit", "-m", message], { cwd, encoding: "utf8" });
  if (commit.status !== 0) return null;
  return commit.stdout.trim() || message;
}
