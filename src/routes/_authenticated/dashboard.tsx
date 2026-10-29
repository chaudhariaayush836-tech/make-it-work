import { createFileRoute, Link } from "@tanstack/react-router";
import { assess } from "@/lib/cashgraph";
import { usePortfolio } from "@/lib/portfolio-store";
import { Header, RiskBadge } from "@/components/RiskBadge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Portfolio early warnings — CashGraph" },
      { name: "description", content: "See which SME borrowers show financial deterioration and why." },
      { property: "og:title", content: "Portfolio early warnings — CashGraph" },
      { property: "og:description", content: "See which SME borrowers show financial deterioration and why." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { borrowers, isSample, decisions } = usePortfolio();
  const rows = borrowers
    .map((b) => ({ b, a: assess(b) }))
    .sort((x, y) => y.a.score - x.a.score);
  const count = (l: string) => rows.filter((r) => r.a.level === l).length;
  const exposure = rows.filter((r) => r.a.level === "high").reduce((s, r) => s + r.b.loan, 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Portfolio early warnings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Borrowers ranked by how many risk signals are changing together. The credit team makes the final call.
        </p>
        {isSample && (
          <p className="mt-4 text-sm text-muted-foreground">
            Showing sample data. <Link to="/upload" className="text-foreground underline">Upload a lender's data</Link> to run a pilot.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
          {[
            ["Borrowers", rows.length],
            ["High priority", count("high")],
            ["Watchlist", count("watch")],
            ["Exposure at high risk", `₹${exposure} L`],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-5">
              <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
              <div className="mt-2 text-2xl font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border font-mono text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-normal">Borrower</th>
                <th className="px-4 py-3 text-left font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Risk score</th>
                <th className="hidden px-4 py-3 text-left font-normal md:table-cell">Why</th>
                <th className="px-4 py-3 text-right font-normal">Loan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ b, a }) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-4">
                    <Link to="/borrower/$id" params={{ id: b.id }} className="font-medium hover:underline">
                      {b.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {b.sector} · {b.city}
                      {decisions[b.id]?.length ? ` · Reviewed: ${decisions[b.id][0].action}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-4"><RiskBadge level={a.level} /></td>
                  <td className="px-4 py-4 text-right font-mono">{a.score}</td>
                  <td className="hidden max-w-xs px-4 py-4 text-muted-foreground md:table-cell">{a.explanation}</td>
                  <td className="px-4 py-4 text-right font-mono">₹{b.loan} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
