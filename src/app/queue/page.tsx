import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_PRIORITY_BATCH, INTEL_WAVE, isPriorityPlugin } from "@/lib/lab/priority";
import { loadSnapshot } from "@/lib/lab/snapshot";
import type { PluginCandidate, ExperimentState } from "@/lib/lab/types";

export const dynamic = "force-dynamic";

export default function QueuePage() {
  const { experiment, catalog } = loadSnapshot();
  const byId = new Map(catalog.map((p) => [p.id, p]));

  return (
    <AppShell current="/queue">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Candidate queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Cheap-model evals stay on flash. Skins and pets from the awesome list are omitted.
            New intelligence picks from vvlife/awesome-deepseek-harness-plugins are the current wave.
          </p>
        </div>
        <BatchCard
          title="Awesome-list intelligence wave"
          ids={[...INTEL_WAVE]}
          experiment={experiment}
          byId={byId}
        />
        <BatchCard
          title="Earlier user batch"
          ids={[...USER_PRIORITY_BATCH]}
          experiment={experiment}
          byId={byId}
        />
        {experiment.queue.length === 0 ? (
          <EmptyState title="Queue is empty">
            The champion is frozen. Add an idea from the Ideas page or reset the experiment.
          </EmptyState>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{experiment.queue.length} waiting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiment.queue.map((id, index) => {
                const plugin = byId.get(id);
                return (
                  <div key={id} className="border-b border-border/70 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-8 font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-medium">{plugin?.name ?? id}</p>
                      {plugin ? <StatusBadge value={plugin.kind} /> : null}
                      {plugin ? <StatusBadge value={plugin.category} /> : null}
                      {isPriorityPlugin(id) ? <StatusBadge value="priority" /> : null}
                      {plugin?.breaksCheapEval ? <StatusBadge value="cheap-eval skip" /> : null}
                    </div>
                    <p className="mt-2 pl-8 text-sm text-muted-foreground">
                      {plugin?.hypothesis ?? "Unknown plugin."}
                    </p>
                    {plugin?.notes ? (
                      <p className="mt-1 pl-8 text-xs text-muted-foreground">{plugin.notes}</p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function BatchCard({
  title,
  ids,
  experiment,
  byId,
}: {
  title: string;
  ids: string[];
  experiment: ExperimentState;
  byId: Map<string, PluginCandidate>;
}) {
  const tested = new Set(experiment.trials.map((t) => t.candidateId));
  const skipped = new Set(experiment.skipped.map((s) => s.id));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ids.map((id, index) => {
          const plugin = byId.get(id);
          const inQueue = experiment.queue.includes(id);
          const kept = experiment.championPluginIds.includes(id);
          const trial = experiment.trials.find((t) => t.candidateId === id);
          const status = kept
            ? "keep"
            : trial
              ? trial.decision
              : skipped.has(id)
                ? "skip"
                : inQueue
                  ? "queued"
                  : tested.has(id)
                    ? "tested"
                    : "queued";
          return (
            <div key={id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-6 font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="font-medium">{id}</p>
              {plugin && plugin.name !== id ? (
                <span className="text-xs text-muted-foreground">{plugin.name}</span>
              ) : null}
              <StatusBadge value={status} />
              {plugin?.breaksCheapEval ? <StatusBadge value="cheap-eval skip" /> : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
