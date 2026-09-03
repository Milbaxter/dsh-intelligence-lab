import { AppShell } from "@/components/app-shell";
import { LoopConsole } from "@/components/loop-console";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const snap = loadSnapshot();
  return (
    <AppShell current="/">
      <LoopConsole initial={snap} />
    </AppShell>
  );
}
