import { Badge } from "@/components/ui/badge";

const TONE: Record<string, string> = {
  keep: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  baseline: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  drop: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  skip: "border-border bg-secondary text-muted-foreground",
  "ablate-drop": "border-orange-500/30 bg-orange-500/15 text-orange-200",
  "ablate-keep": "border-sky-500/30 bg-sky-500/15 text-sky-200",
  simulated: "border-amber-500/30 bg-amber-500/15 text-amber-200",
  queued: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  priority: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  "cheap-eval skip": "border-orange-500/30 bg-orange-500/15 text-orange-200",
  running: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  idle: "border-border bg-secondary text-muted-foreground",
  error: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  community: "border-border bg-secondary text-muted-foreground",
  remix: "border-violet-500/30 bg-violet-500/15 text-violet-300",
  idea: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  official: "border-sky-500/30 bg-sky-500/15 text-sky-300",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={TONE[value] ?? TONE.idle}>
      {value}
    </Badge>
  );
}
