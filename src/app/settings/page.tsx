import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { experiment, worker, readiness } = loadSnapshot();

  return (
    <AppShell current="/settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lab settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Cheap model for every scored run. Smart model only for meta-reviews. Full Lite is
            300 instances × 3 repeats × N plugins — start on lite50 until the loop is trustworthy.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Search policy</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm initial={experiment.config} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Self-hosted worker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
            A Cloud Agent cannot register your machine. Run{" "}
            <code className="text-foreground">./scripts/start-cursor-worker.sh</code> on a
            Docker box signed into Cursor. Details are on the Worker page.
            </p>
            <p>
              On a machine with Docker and a DeepSeek key, run{" "}
              <code className="text-foreground">pnpm lab:daemon -- --mode live --auto-commit</code>.
              That process holds a lock, recovers if it dies, and writes scores into{" "}
              <code className="text-foreground">data/</code>.
            </p>
            <p>
              Live readiness:{" "}
              {readiness.ready ? (
                <span className="text-emerald-300">ready</span>
              ) : (
                <span className="text-amber-200">missing {readiness.missing.join(", ") || "unknown"}</span>
              )}
            </p>
            {worker ? (
              <p>
                Last heartbeat from <span className="text-foreground">{worker.hostname}</span>
                {worker.pid ? ` (pid ${worker.pid})` : ""}: {worker.note}
              </p>
            ) : (
              <p>No heartbeat file yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
