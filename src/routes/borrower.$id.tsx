import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { assess } from "@/lib/cashgraph";
import { portfolio, usePortfolio, type Decision } from "@/lib/portfolio-store";
import { Header, Label, RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/borrower/$id")({
  head: () => {
    const t = "Borrower risk review — CashGraph";
    const d = "Risk signals, explanation, suggested action and credit decision for this borrower.";
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

const actionLabel = { review: "Escalate for credit review", monitor: "Keep monitoring", dismiss: "No concern" };
const outcomeLabel = { pending: "Outcome pending", delinquent: "Became delinquent", recovered: "Recovered", false_alarm: "False alarm" };

function BorrowerPage() {
  const { id } = Route.useParams();
  const { borrowers, decisions } = usePortfolio();
  const b = borrowers.find((x) => x.id === id);
  const [action, setAction] = useState<Decision["action"]>("review");
  const [note, setNote] = useState("");

  if (!b)
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <p>This borrower isn't in the current portfolio.</p>
          <Link to="/" className="underline">Back to portfolio</Link>
        </main>
      </div>
    );

  const a = assess(b);
  const log = decisions[b.id] ?? [];
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
          <Label>Explanation</Label>
          <p className="mt-1 text-lg">{a.explanation}</p>
          <div className="mt-4"><Label>Suggested action</Label></div>
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-md border border-border bg-card p-5">
            <Label>Last {b.months.length} months (₹ lakh)</Label>
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

          <section className="rounded-md border border-border bg-card p-5">
            <Label>Credit team decision</Label>
            <div className="mt-3 space-y-2">
              {(Object.keys(actionLabel) as Decision["action"][]).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="action" checked={action === k} onChange={() => setAction(k)} />
                  {actionLabel[k]}
                </label>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="mt-3 w-full rounded-sm border border-input bg-background p-2 text-sm"
              rows={2}
            />
            <Button
              className="mt-2 w-full"
              onClick={() => {
                portfolio.addDecision({ borrowerId: b.id, action, note, outcome: "pending", at: new Date().toISOString() });
                setNote("");
              }}
            >
              Save decision
            </Button>

            {log.length > 0 && (
              <ul className="mt-5 space-y-3 border-t border-border pt-4">
                {log.map((d, i) => (
                  <li key={d.at} className="text-sm">
                    <div className="font-medium">{actionLabel[d.action]}</div>
                    <div className="text-xs text-muted-foreground">{new Date(d.at).toLocaleString("en-IN")}{d.note && ` · ${d.note}`}</div>
                    <select
                      value={d.outcome}
                      onChange={(e) => portfolio.setOutcome(b.id, i, e.target.value as Decision["outcome"])}
                      className="mt-1 rounded-sm border border-input bg-background px-2 py-1 text-xs"
                    >
                      {Object.entries(outcomeLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Recording what really happened is how the warnings get better over time.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
