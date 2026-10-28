import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { assess, borrowers } from "@/lib/cashgraph";
import { Header, RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/borrower/$id")({
  loader: ({ params }) => {
    const b = borrowers.find((x) => x.id === params.id);
    if (!b) throw notFound();
    return { b };
  },
  head: ({ loaderData }) => {
    const t = `${loaderData?.b.name ?? "Borrower"} — CashGraph`;
    const d = "Risk signals, explanation and suggested action for this borrower.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BorrowerPage,
});

function BorrowerPage() {
  const { b } = Route.useLoaderData();
  const a = assess(b);
  const data = b.months.map((m) => ({
    month: m.month,
    "Net cash flow": +(m.inflow - m.outflow).toFixed(1),
    Balance: m.balance,
    "Overdue receivables": m.overdueReceivables,
  }));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">← Portfolio</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{b.name}</h1>
            <p className="mt-1 text-muted-foreground">{b.sector} · {b.city} · Loan ₹{b.loan} lakh</p>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={a.level} />
            <span className="font-mono text-2xl">{a.score}<span className="text-sm text-muted-foreground">/100</span></span>
          </div>
        </div>

        <section className={cn("mt-8 rounded-md border p-5", a.level === "high" ? "border-risk-high/40 bg-risk-high/5" : "border-border bg-card")}>
          <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Explanation</div>
          <p className="mt-1 text-lg">{a.explanation}</p>
          <div className="mt-4 font-mono text-xs uppercase tracking-wide text-muted-foreground">Suggested action</div>
          <p className="mt-1 font-medium">{a.action}</p>
        </section>

        <section className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {a.signals.map((s) => (
            <div key={s.key} className="bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.label}</span>
                <span className={cn("font-mono text-xs", s.triggered ? "text-risk-high" : "text-risk-stable")}>
                  {s.triggered ? "● Triggered" : "○ OK"}
                </span>
              </div>
              <div className="mt-2 font-mono text-xl">{s.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-md border border-border bg-card p-5">
          <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Last 6 months (₹ lakh)</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Line type="monotone" dataKey="Balance" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="Net cash flow" stroke="var(--chart-3)" strokeWidth={2} />
                <Line type="monotone" dataKey="Overdue receivables" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
