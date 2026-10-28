import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CSV_HEADER, parseCsv, sampleCsv } from "@/lib/cashgraph";
import { portfolio, usePortfolio } from "@/lib/portfolio-store";
import { Header, Label } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload borrower data — CashGraph" },
      { name: "description", content: "Load a lender's monthly borrower data to run CashGraph's early-warning rules." },
      { property: "og:title", content: "Upload borrower data — CashGraph" },
      { property: "og:description", content: "Load a lender's monthly borrower data to run CashGraph's early-warning rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upload,
});

function download() {
  const url = URL.createObjectURL(new Blob([sampleCsv()], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "cashgraph-template.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

function Upload() {
  const { isSample, borrowers } = usePortfolio();
  const [errors, setErrors] = useState<string[]>([]);
  const nav = useNavigate();

  async function onFile(f: File) {
    const r = parseCsv(await f.text());
    setErrors(r.errors);
    if (r.borrowers.length) {
      portfolio.upload(r.borrowers);
      if (!r.errors.length) nav({ to: "/" });
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Upload borrower data</h1>
        <p className="mt-2 text-muted-foreground">
          For a pilot: export a lender's past monthly figures (one row per borrower per month, at least 4 months) and see who CashGraph would have flagged. Data stays in this browser.
        </p>

        <div className="mt-6 rounded-md border border-border bg-card p-5">
          <Label>Currently showing</Label>
          <p className="mt-1 font-medium">{isSample ? "Sample portfolio (6 made-up borrowers)" : `Your uploaded portfolio (${borrowers.length} borrowers)`}</p>
          {!isSample && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => portfolio.reset()}>
              Go back to sample data
            </Button>
          )}
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-card px-6 py-12 text-center hover:bg-muted/50">
          <span className="font-medium">Choose a CSV file</span>
          <span className="mt-1 text-sm text-muted-foreground">Amounts in ₹ lakh</span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>

        {errors.length > 0 && (
          <div className="mt-4 rounded-md border border-risk-high/40 bg-risk-high/5 p-4 text-sm">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}

        <div className="mt-8">
          <Label>Required columns</Label>
          <code className="mt-2 block overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{CSV_HEADER}</code>
          <Button variant="outline" className="mt-3" onClick={download}>Download template with sample data</Button>
        </div>
      </main>
    </div>
  );
}
