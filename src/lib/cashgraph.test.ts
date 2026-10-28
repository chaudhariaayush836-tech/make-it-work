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
