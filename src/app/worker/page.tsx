import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function WorkerPage() {
  const { readiness, worker } = loadSnapshot();

  return (
    <AppShell current="/worker">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cursor worker</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A Cloud Agent in this chat cannot create a My Machines worker. That process has to
            run on a computer you own, signed into your Cursor account. This page is the
            exact bootstrap.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Register the machine with Cursor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              On a Linux or macOS box with Docker and outbound HTTPS, in this repo:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs">
              {`curl https://cursor.com/install -fsS | bash
agent login
chmod +x scripts/start-cursor-worker.sh
./scripts/start-cursor-worker.sh`}
            </pre>
            <p className="text-muted-foreground">
              Leave that process running. The machine name is{" "}
              <code className="text-foreground">dsh-lab</code>. It should appear in the
              environment dropdown at{" "}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://cursor.com/agents"
                target="_blank"
                rel="noreferrer"
              >
                cursor.com/agents
              </a>
              . Official docs:{" "}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://cursor.com/docs/cloud-agent/self-hosted/my-machines"
                target="_blank"
                rel="noreferrer"
              >
                My Machines
              </a>
              . Then start a Cloud Agent targeting{" "}
              <code className="text-foreground">dsh-lab</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Run the live loop on that box</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              DeepSeek Harness is pinned to <code className="text-foreground">deepseek-v4-flash</code>{" "}
              for every scored SWE-bench run. Smart models are only allowed for meta-review.
            </p>
            <pre className="overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs">
              {`export DEEPSEEK_API_KEY=sk-...
chmod +x scripts/bootstrap-lab-machine.sh
./scripts/bootstrap-lab-machine.sh`}
            </pre>
            <p className="text-muted-foreground">
              That installs swebench + the DSH SDK, then starts{" "}
              <code className="text-foreground">pnpm lab:daemon -- --mode live --model deepseek-v4-flash --auto-commit</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This machine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Live readiness:{" "}
              {readiness.ready ? (
                <span className="text-emerald-300">ready</span>
              ) : (
                <span className="text-amber-200">missing {readiness.missing.join(", ")}</span>
              )}
            </p>
            {worker ? (
              <p>
                Last lab heartbeat: {worker.hostname}
                {worker.pid ? ` pid ${worker.pid}` : ""} — {worker.note}
              </p>
            ) : (
              <p>No lab daemon heartbeat yet.</p>
            )}
            <p>
              Connected Cursor workers are listed only while{" "}
              <code className="text-foreground">agent worker start</code> is running. This
              cloud session currently sees none.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
