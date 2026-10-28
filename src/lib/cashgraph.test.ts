import { describe, it, expect } from "vitest";
import { assess, borrowers, type Borrower } from "./cashgraph";

const make = (over: Partial<Borrower["months"][number]>[]): Borrower => ({
  id: "t", name: "T", sector: "", city: "", loan: 1,
  months: over.map((o, i) => ({
    month: String(i), inflow: 10, outflow: 8, balance: 30, receivables: 10,
    overdueReceivables: 1, obligations: 1, topCustomerShare: 0.2, ...o,
  })),
});

describe("risk engine", () => {
  it("flags cash flow down >20% + overdue up + runway <1 month as high priority", () => {
    const b = make([{}, {}, {}, { inflow: 8.5 }, { inflow: 8.5 }, { inflow: 8.5, overdueReceivables: 2, balance: 9 }]);
    expect(assess(b).level).toBe("high");
  });
  it("stable borrower raises no signals", () => {
    expect(assess(make([{}, {}, {}, {}, {}, {}])).level).toBe("stable");
  });
  it("Apex Components is flagged high", () => {
    expect(assess(borrowers.find((b) => b.id === "apex-components")!).level).toBe("high");
  });
});

import { parseCsv, sampleCsv, roi } from "./cashgraph";
describe("csv import", () => {
  it("round-trips the sample file into 6 borrowers", () => {
    const r = parseCsv(sampleCsv());
    expect(r.errors).toEqual([]);
    expect(r.borrowers).toHaveLength(6);
  });
  it("rejects borrowers with fewer than 4 months", () => {
    const csv = sampleCsv().split("\n").slice(0, 4).join("\n");
    expect(parseCsv(csv).borrowers).toHaveLength(0);
  });
});
describe("roi", () => {
  it("5,000 borrowers at ₹100/month + ₹5L platform costs ₹65L a year", () => {
    const r = roi({ borrowers: 5000, feePerBorrower: 100, platformFeeYear: 500000, avgLoanLakh: 30, defaultRate: 0.04, earlyCatchRate: 0.4, lossReduction: 0.3 });
    expect(r.costYear).toBe(6500000);
    expect(r.savedYear).toBe(72000000);
  });
});
