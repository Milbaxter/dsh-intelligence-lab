import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { lockPath, stopPath } from "./paths";

interface LockFile {
  pid: number;
  hostname: string;
  acquiredAt: string;
}

export function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function readLock(cwd = process.cwd()): LockFile | null {
  const file = lockPath(cwd);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as LockFile;
  } catch {
    return null;
  }
}

export function acquireLock(cwd = process.cwd()): void {
  const current = readLock(cwd);
  if (current && current.pid !== process.pid && pidAlive(current.pid)) {
    throw new Error(`Lab is already running (pid ${current.pid}). Stop it or wait.`);
  }
  writeFileSync(
    lockPath(cwd),
    `${JSON.stringify(
      {
        pid: process.pid,
        hostname: hostname(),
        acquiredAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

export function releaseLock(cwd = process.cwd()): void {
  const current = readLock(cwd);
  if (current && current.pid !== process.pid) return;
  const file = lockPath(cwd);
  if (existsSync(file)) unlinkSync(file);
}

export function requestStop(cwd = process.cwd()): void {
  writeFileSync(stopPath(cwd), `${new Date().toISOString()}\n`);
}

export function clearStop(cwd = process.cwd()): void {
  const file = stopPath(cwd);
  if (existsSync(file)) unlinkSync(file);
}

export function stopRequested(cwd = process.cwd()): boolean {
  return existsSync(stopPath(cwd));
}

export async function withLock<T>(cwd: string, fn: () => Promise<T>): Promise<T> {
  acquireLock(cwd);
  try {
    return await fn();
  } finally {
    releaseLock(cwd);
  }
}
