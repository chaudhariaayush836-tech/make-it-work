import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CashGraph — Early-warning risk for SME lenders" },
      { name: "description", content: "CashGraph watches borrower cash flow, receivables and repayments to flag SME loan stress months before default." },
      { property: "og:title", content: "CashGraph — Early-warning risk for SME lenders" },
      { property: "og:description", content: "Flag SME loan stress months before default, with plain-language explanations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const stats = [["3–6 mo", "earlier warning"], ["6", "risk signals tracked"], ["100%", "explainable scores"]];
const features = [
  ["Continuous monitoring", "Cash flow, GST sales, receivables and overdue payments, checked every month — not just at approval."],
  ["Signals that agree", "Borrowers are flagged only when several warning signs move together, cutting false alarms."],
  ["Plain-language reasons", "Every score comes with why, so credit committees can act with confidence."],
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-mono text-sm tracking-[0.2em]">CASHGRAPH</span>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Button asChild size="sm"><Link to="/auth">Sign in</Link></Button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
        <div className="font-mono text-xs tracking-[0.2em] text-gold">CREDIT RISK INTELLIGENCE</div>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">See loan stress before it becomes default.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">CashGraph monitors your SME borrowers' financial data and tells your credit team who needs attention, and why.</p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg"><Link to="/auth">Get started</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/pricing">See ROI</Link></Button>
        </div>
        <div className="mt-16 grid grid-cols-3 border-y border-border">
          {stats.map(([v, l]) => (
            <div key={l} className="py-6 pr-4">
              <div className="font-serif text-3xl md:text-4xl">{v}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {features.map(([t, d], i) => (
            <div key={t}>
              <div className="font-mono text-xs text-gold">0{i + 1}</div>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-6 py-8 font-mono text-xs text-muted-foreground">© 2026 CashGraph · For lenders, NBFCs and credit teams</footer>
    </div>
  );
}
