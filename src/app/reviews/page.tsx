import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { when } from "@/lib/format";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  const { experiment } = loadSnapshot();

  return (
    <AppShell current="/reviews">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meta-reviews</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every {experiment.config.metaEvery} judged plugins, a smarter model looks at the
            whole search. If that model is offline, a local reviewer writes the same structured
            note so the loop never stalls.
          </p>
        </div>
        {experiment.reviews.length === 0 ? (
          <EmptyState title="No reviews yet">
            Keep the loop running. The first review lands after {experiment.config.metaEvery}{" "}
            keep/drop decisions.
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {experiment.reviews
              .slice()
              .reverse()
              .map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{review.summary}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {review.model} · {when(review.createdAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                    <List title="Findings" items={review.findings} />
                    <List title="Next experiments" items={review.nextExperiments} />
                    <List title="Suggested remixes" items={review.suggestedRemixes} />
                    <List
                      title="Suggested drops from champion"
                      items={review.suggestedDrops.length ? review.suggestedDrops : ["None"]}
                    />
                    <List
                      title="Actions applied"
                      items={review.actions?.length ? review.actions : ["Pending next step"]}
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="list-disc space-y-1 pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
