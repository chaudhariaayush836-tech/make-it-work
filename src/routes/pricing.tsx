import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { roi, type RoiInput } from "@/lib/cashgraph";
import { Header, Label } from "@/components/RiskBadge";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & ROI calculator — CashGraph" },
      { name: "description", content: "Estimate what CashGraph costs a lender and how much early warnings could save." },
      { property: "og:title", content: "Pricing & ROI calculator — CashGraph" },
      { property: "og:description", content: "Estimate what CashGraph costs a lender and how much early warnings could save." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const lakh = (n: number) => `₹${(n / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })} L`;

const fields: { k: keyof RoiInput; label: string; pct?: boolean; step: number }[] = [
  { k: "borrowers", label: "Borrowers monitored", step: 100 },
  { k: "feePerBorrower", label: "Fee per borrower / month (₹)", step: 10 },
  { k: "platformFeeYear", label: "Platform fee / year (₹)", step: 50000 },
  { k: "avgLoanLakh", label: "Average loan (₹ lakh)", step: 1 },
  { k: "defaultRate", label: "Yearly default rate (%)", pct: true, step: 0.5 },
  { k: "earlyCatchRate", label: "Defaults flagged early (%)", pct: true, step: 5 },
  { k: "lossReduction", label: "Loss avoided when caught early (%)", pct: true, step: 5 },
];

function Pricing() {
  const [v, setV] = useState<RoiInput>({
    borrowers: 5000, feePerBorrower: 100, platformFeeYear: 500000, avgLoanLakh: 30,
    defaultRate: 0.04, earlyCatchRate: 0.4, lossReduction: 0.3,
  });
  const r = roi(v);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing & ROI</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Per-borrower monthly fee plus a yearly platform fee. Use this in sales calls to show a lender money saved, not features. Starting numbers are estimates — change them to the lender's real figures.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4 rounded-md border border-border bg-card p-5">
            {fields.map((f) => (
              <label key={f.k} className="flex items-center justify-between gap-4 text-sm">
                <span>{f.label}</span>
                <input
                  type="number"
                  step={f.step}
                  min={0}
                  value={f.pct ? +(v[f.k] * 100).toFixed(2) : v[f.k]}
                  onChange={(e) => {
                    const n = Number(e.target.value) || 0;
                    setV({ ...v, [f.k]: f.pct ? n / 100 : n });
                  }}
                  className="w-32 rounded-sm border border-input bg-background px-2 py-1.5 text-right font-mono"
                />
              </label>
            ))}
          </div>

          <div className="grid gap-px self-start overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {[
              ["Lender pays / year", lakh(r.costYear)],
              ["Expected defaults / year", r.defaults.toFixed(0)],
              ["Losses avoided / year", lakh(r.savedYear)],
              ["Return on cost", `${r.multiple.toFixed(1)}×`],
            ].map(([k, val]) => (
              <div key={k} className="bg-card p-5">
                <Label>{k}</Label>
                <div className="mt-2 text-2xl font-semibold">{val}</div>
              </div>
            ))}
            <div className="bg-card p-5 sm:col-span-2">
              <Label>Your revenue from this lender</Label>
              <div className="mt-2 text-2xl font-semibold">{lakh(r.costYear)} / year</div>
              <p className="mt-1 text-sm text-muted-foreground">10 lenders this size ≈ {lakh(r.costYear * 10)} a year.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
