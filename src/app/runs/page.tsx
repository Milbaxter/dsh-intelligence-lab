import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { delta, pct, when } from "@/lib/format";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function RunsPage() {
  const { experiment } = loadSnapshot();
  const ranked = [...experiment.trials].sort(
    (a, b) => b.candidateScore.meanResolveRate - a.candidateScore.meanResolveRate,
  );

  return (
    <AppShell current="/runs">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Runs and leaderboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every setup is default DSH plugins plus the plugins that were kept so far, then
            the candidate under test. Scores are the mean of {experiment.config.repeats} repeats.
            {experiment.config.mode === "dry"
              ? " These numbers are simulated from catalog priors."
              : ""}
          </p>
        </div>
        {experiment.trials.length === 0 ? (
          <EmptyState title="No runs yet">Start the loop from the home page.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setup</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Mean</TableHead>
                  <TableHead>Repeats</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((trial) => (
                  <TableRow key={trial.id}>
                    <TableCell>
                      <p className="font-medium">{trial.candidateName}</p>
                      <p className="max-w-md font-mono text-xs text-muted-foreground">
                        {trial.testedPluginIds.length === 0
                          ? "default plugins"
                          : trial.testedPluginIds.join(" + ")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={trial.decision} />
                    </TableCell>
                    <TableCell>{pct(trial.candidateScore.meanResolveRate)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {trial.candidateScore.repeats.map((r) => pct(r.resolveRate)).join(" · ")}
                    </TableCell>
                    <TableCell>{delta(trial.deltaPp)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{when(trial.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
