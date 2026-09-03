export function pct(rate: number | null | undefined): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  return `${(rate * 100).toFixed(2)}%`;
}

export function delta(pp: number | null | undefined): string {
  if (pp == null || Number.isNaN(pp)) return "—";
  const value = pp * 100;
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} pp`;
}

export function when(iso: string | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
