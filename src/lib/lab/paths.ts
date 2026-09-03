import path from "node:path";

export function dataDir(cwd = process.cwd()) {
  return path.join(cwd, "data");
}

export function experimentPath(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "experiment.json");
}

export function catalogPath(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "catalog.json");
}

export function ideasPath(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "ideas.json");
}

export function splitsDir(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "splits");
}

export function runsDir(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "runs");
}

export function workerStatusPath(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "worker-status.json");
}

export function remixesDir(cwd = process.cwd()) {
  return path.join(cwd, "remixes");
}

export function lockPath(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "experiment.lock");
}

export function stopPath(cwd = process.cwd()) {
  return path.join(dataDir(cwd), "daemon.stop");
}
