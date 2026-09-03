import type { LabConfig, RepeatScore, SetupScore } from "./types";
import { mean, pooledSe, sampleStd, standardError } from "./stats";

export function summarizeSetup(
  setupId: string,
  pluginIds: string[],
  repeats: RepeatScore[],
): SetupScore {
  const rates = repeats.map((r) => r.resolveRate);
  return {
    setupId,
    pluginIds,
    repeats,
    meanResolveRate: mean(rates),
    stdResolveRate: sampleStd(rates),
    seResolveRate: standardError(rates),
    meanResolved: mean(repeats.map((r) => r.resolved)),
  };
}

export function decideKeep(
  champion: SetupScore,
  candidate: SetupScore,
  config: LabConfig,
): { keep: boolean; reason: string; deltaPp: number } {
  const champRates = champion.repeats.map((r) => r.resolveRate);
  const candRates = candidate.repeats.map((r) => r.resolveRate);
  const delta = candidate.meanResolveRate - champion.meanResolveRate;
  const se = pooledSe(champRates, candRates);
  const margin = config.keepMarginPp / 100;
  const threshold = Math.max(margin, config.keepSeMultiplier * se);

  if (delta > threshold) {
    return {
      keep: true,
      deltaPp: delta,
      reason: `Mean resolve rate rose ${pp(delta)} (threshold ${pp(threshold)} from ${config.keepMarginPp} pp floor and ${config.keepSeMultiplier}× pooled SE ${pp(se)}).`,
    };
  }

  return {
    keep: false,
    deltaPp: delta,
    reason: `Mean resolve rate changed ${pp(delta)}, below keep threshold ${pp(threshold)} (${config.repeats}× repeats, pooled SE ${pp(se)}).`,
  };
}

function pp(rate: number): string {
  const value = rate * 100;
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} pp`;
}
