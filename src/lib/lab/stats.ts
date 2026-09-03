export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sampleStd(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function standardError(values: number[]): number {
  if (values.length === 0) return 0;
  return sampleStd(values) / Math.sqrt(values.length);
}

export function pooledSe(a: number[], b: number[]): number {
  const seA = standardError(a);
  const seB = standardError(b);
  return Math.sqrt(seA ** 2 + seB ** 2);
}

export function formatPp(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export function formatDeltaPp(delta: number): string {
  const pp = delta * 100;
  const sign = pp >= 0 ? "+" : "";
  return `${sign}${pp.toFixed(2)} pp`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Mulberry32 — small, seedable, good enough for dry-run noise. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
