import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function CatalogPage() {
  const { catalog, experiment } = loadSnapshot();
  const kept = new Set(experiment.championPluginIds);
  const tested = new Set(experiment.trials.map((t) => t.candidateId));

  return (
    <AppShell current="/catalog">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plugin catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {catalog.length} intelligence-first candidates from public DSH repos, plus local
            remixes. The prior column is an author guess used only by dry-run. Live SWE-bench
            ignores it.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Dry prior</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.map((plugin) => (
                <TableRow key={plugin.id}>
                  <TableCell>
                    <p className="font-medium">{plugin.name}</p>
                    <p className="max-w-xl text-xs text-muted-foreground">{plugin.whyForSweBench}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={plugin.kind} />
                  </TableCell>
                  <TableCell className="text-sm">{plugin.category}</TableCell>
                  <TableCell className="text-sm">{plugin.risk}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {plugin.priorBoostPp >= 0 ? "+" : ""}
                    {plugin.priorBoostPp.toFixed(1)} pp
                  </TableCell>
                  <TableCell>
                    {kept.has(plugin.id) ? (
                      <StatusBadge value="keep" />
                    ) : tested.has(plugin.id) ? (
                      <StatusBadge value="drop" />
                    ) : (
                      <span className="text-xs text-muted-foreground">queued</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
