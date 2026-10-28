import { Link } from "@tanstack/react-router";
import type { Assessment } from "@/lib/cashgraph";
import { cn } from "@/lib/utils";

const styles = {
  high: "bg-risk-high/10 text-risk-high border-risk-high/30",
  watch: "bg-risk-watch/15 text-foreground border-risk-watch/40",
  stable: "bg-risk-stable/10 text-risk-stable border-risk-stable/30",
};
const labels = { high: "High priority", watch: "Watchlist", stable: "Stable" };

export function RiskBadge({ level }: { level: Assessment["level"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs uppercase tracking-wide", styles[level])}>
      <span className={cn("size-1.5 rounded-full", level === "high" ? "bg-risk-high" : level === "watch" ? "bg-risk-watch" : "bg-risk-stable")} />
      {labels[level]}
    </span>
  );
}

const nav = [
  { to: "/", label: "Portfolio" },
  { to: "/upload", label: "Upload data" },
  { to: "/pricing", label: "Pricing & ROI" },
] as const;

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link to="/" className="font-mono text-sm font-medium tracking-[0.2em]">CASHGRAPH</Link>
        <nav className="flex gap-5 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{children}</div>;
}
