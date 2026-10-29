import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
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
  { to: "/dashboard", label: "Portfolio" },
  { to: "/upload", label: "Upload data" },
  { to: "/pricing", label: "Pricing & ROI" },
] as const;

export function Header() {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link to="/dashboard" className="font-mono text-sm font-medium tracking-[0.2em]">CASH<span className="text-gold">GRAPH</span></Link>
        <nav className="flex items-center gap-5 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-primary-foreground/70 hover:text-primary-foreground" activeProps={{ className: "!text-primary-foreground font-medium" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
          <button onClick={signOut} className="rounded-sm border border-primary-foreground/30 px-3 py-1 text-xs hover:bg-primary-foreground/10">Sign out</button>
        </nav>
      </div>
    </header>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{children}</div>;
}
