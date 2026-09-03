import Link from "next/link";
import { FlaskConical } from "lucide-react";

const NAV = [
  { href: "/", label: "Loop" },
  { href: "/queue", label: "Queue" },
  { href: "/catalog", label: "Catalog" },
  { href: "/runs", label: "Runs" },
  { href: "/reviews", label: "Reviews" },
  { href: "/ideas", label: "Ideas" },
  { href: "/worker", label: "Worker" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: string;
}) {
  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <FlaskConical className="size-5 text-emerald-400" />
            <span>DSH Intelligence Lab</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2.5 py-1.5 text-sm ${
                  current === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
