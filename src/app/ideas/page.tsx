import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { IdeaForm } from "@/components/idea-form";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function IdeasPage() {
  const { ideas } = loadSnapshot();

  return (
    <AppShell current="/ideas">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Brainstorm a plugin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              These stay in the repo. Queue one for a live run, or implement it under{" "}
              <code>remixes/</code> first. Dry-run skips ideas so a pitch cannot fake a SWE-bench win.
            </p>
            <IdeaForm />
          </CardContent>
        </Card>
        <div className="space-y-4">
          {ideas.length === 0 ? (
            <EmptyState title="Inbox is empty">Write the first idea on the left.</EmptyState>
          ) : (
            ideas.map((idea) => (
              <Card key={idea.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <CardTitle className="text-base">{idea.title}</CardTitle>
                  <StatusBadge value={idea.status} />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{idea.pitch}</CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
