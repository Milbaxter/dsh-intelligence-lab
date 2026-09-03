import { NextResponse } from "next/server";
import { loadCatalog, loadIdeas, saveCatalog, saveIdeas, loadExperiment, saveExperiment } from "@/lib/lab/store";
import type { Idea, PluginCandidate } from "@/lib/lab/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string; pitch?: string; queue?: boolean };
  if (!body.title || !body.pitch) {
    return NextResponse.json({ error: "title and pitch are required" }, { status: 400 });
  }
  const ideas = loadIdeas();
  const idea: Idea = {
    id: `idea-${Date.now()}`,
    createdAt: new Date().toISOString(),
    title: body.title,
    pitch: body.pitch,
    status: body.queue ? "queued" : "inbox",
  };
  ideas.unshift(idea);
  saveIdeas(ideas);

  if (body.queue) {
    const catalog = loadCatalog();
    const plugin: PluginCandidate = {
      id: idea.id,
      name: idea.title,
      repo: "local:ideas",
      install: `idea:${idea.id}`,
      kind: "idea",
      category: "remix",
      hypothesis: idea.pitch,
      whyForSweBench: idea.pitch,
      risk: "medium",
      priorBoostPp: 0,
      distractionPp: 0,
    };
    catalog.push(plugin);
    saveCatalog(catalog);
    const exp = loadExperiment();
    exp.queue.push(plugin.id);
    saveExperiment(exp);
  }

  return NextResponse.json(idea);
}
