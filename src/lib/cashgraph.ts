// CashGraph prototype: simulated borrower data + rules-based early-warning engine.

export type Month = {
  month: string;
  inflow: number; // ₹ lakh
  outflow: number;
  balance: number; // closing balance
  receivables: number;
  overdueReceivables: number;
  obligations: number; // monthly debt service
  topCustomerShare: number; // 0..1
};

export type Borrower = {
  id: string;
  name: string;
  sector: string;
  city: string;
  loan: number; // ₹ lakh
  months: Month[];
};

export type Signal = {
  key: string;
  label: string;
  value: string;
  triggered: boolean;
  detail: string;
};

export type Assessment = {
  score: number; // 0-100, higher = riskier
  level: "high" | "watch" | "stable";
  signals: Signal[];
  explanation: string;
  action: string;
};

const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

function series(
  base: Omit<Month, "month">,
  drift: Partial<Record<keyof Omit<Month, "month">, number>>,
): Month[] {
  return MONTHS.map((month, i) => {
    const m: Month = { month, ...base };
    (Object.keys(drift) as (keyof Omit<Month, "month">)[]).forEach((k) => {
      const v = base[k] * Math.pow(1 + (drift[k] ?? 0), i);
      m[k] = Math.round(v * 100) / 100;
    });
    return m;
  });
}

export const borrowers: Borrower[] = [
  {
    id: "apex-components",
    name: "Apex Components Pvt Ltd",
    sector: "Auto parts",
    city: "Pune",
    loan: 50,
    months: series(
      { inflow: 42, outflow: 35, balance: 30, receivables: 20, overdueReceivables: 3, obligations: 4.5, topCustomerShare: 0.32 },
      { inflow: -0.06, outflow: 0.01, balance: -0.16, receivables: 0.08, overdueReceivables: 0.22, topCustomerShare: 0.07 },
    ),
  },
  {
    id: "shakti-textiles",
    name: "Shakti Textiles",
    sector: "Textiles",
    city: "Surat",
    loan: 35,
    months: series(
      { inflow: 28, outflow: 23, balance: 22, receivables: 14, overdueReceivables: 2, obligations: 3, topCustomerShare: 0.28 },
      { inflow: -0.012, balance: -0.05, overdueReceivables: 0.06 },
    ),
  },
  {
    id: "greenleaf-foods",
    name: "Greenleaf Foods",
    sector: "Food processing",
    city: "Indore",
    loan: 80,
    months: series(
      { inflow: 65, outflow: 52, balance: 48, receivables: 26, overdueReceivables: 2.5, obligations: 6, topCustomerShare: 0.18 },
      { inflow: 0.02, outflow: 0.015, balance: 0.02 },
    ),
  },
  {
    id: "nova-logistics",
    name: "Nova Logistics",
    sector: "Logistics",
    city: "Chennai",
    loan: 120,
    months: series(
      { inflow: 90, outflow: 76, balance: 40, receivables: 45, overdueReceivables: 6, obligations: 11, topCustomerShare: 0.41 },
      { inflow: -0.05, outflow: 0.01, balance: -0.2, overdueReceivables: 0.18, topCustomerShare: 0.05 },
    ),
  },
  {
    id: "ruby-pharma",
    name: "Ruby Pharma Distributors",
    sector: "Pharma distribution",
    city: "Ahmedabad",
    loan: 60,
    months: series(
      { inflow: 50, outflow: 42, balance: 35, receivables: 22, overdueReceivables: 2, obligations: 5, topCustomerShare: 0.22 },
      { inflow: 0.01, receivables: 0.03 },
    ),
  },
  {
    id: "kiran-plastics",
    name: "Kiran Plastics",
    sector: "Packaging",
    city: "Ludhiana",
    loan: 25,
    months: series(
      { inflow: 20, outflow: 16.5, balance: 9, receivables: 10, overdueReceivables: 1.5, obligations: 2.2, topCustomerShare: 0.5 },
      { inflow: -0.008, balance: -0.03, topCustomerShare: 0.04 },
    ),
  },
];

const pct = (a: number, b: number) => (b === 0 ? 0 : (a - b) / b);

/** Rules + simple statistics, per blueprint §13. */
export function assess(b: Borrower): Assessment {
  const m = b.months;
  const first3 = m.slice(0, 3);
  const last3 = m.slice(-3);
  const net = (x: Month) => x.inflow - x.outflow;
  const avg = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;

  const cfBefore = avg(first3.map(net));
  const cfAfter = avg(last3.map(net));
  const cfChange = cfBefore === 0 ? 0 : (cfAfter - cfBefore) / Math.abs(cfBefore);

  const latest = m[m.length - 1];
  const start = m[0];
  const overdueShareNow = latest.overdueReceivables / latest.receivables;
  const overdueShareStart = start.overdueReceivables / start.receivables;
  const balanceChange = pct(latest.balance, start.balance);
  const monthlyBurn = latest.obligations + Math.max(0, -net(latest));
  const runwayMonths = latest.balance / monthlyBurn;
  const dscr = Math.max(net(latest), 0) / latest.obligations; // operating cash (pre-debt) / obligations
  const concentrationUp = latest.topCustomerShare - start.topCustomerShare;

  const signals: Signal[] = [
    {
      key: "cashflow",
      label: "Operating cash flow",
      value: cfChange < -1 ? "Turned negative" : `${cfChange >= 0 ? "+" : ""}${(cfChange * 100).toFixed(0)}%`,
      triggered: cfChange < -0.2,
      detail: "Avg net cash flow, last 3 vs first 3 months. Triggers below −20%.",
    },
    {
      key: "overdue",
      label: "Overdue receivables",
      value: `${(overdueShareNow * 100).toFixed(0)}% of book`,
      triggered: overdueShareNow - overdueShareStart > 0.05,
      detail: `Up from ${(overdueShareStart * 100).toFixed(0)}%. Triggers when share rises >5 pts.`,
    },
    {
      key: "liquidity",
      label: "Liquidity runway",
      value: `${runwayMonths.toFixed(1)} months`,
      triggered: runwayMonths < 1,
      detail: "Closing balance ÷ (debt service + any operating cash burn). Triggers under 1 month.",
    },
    {
      key: "balance",
      label: "Bank balance",
      value: `${balanceChange >= 0 ? "+" : ""}${(balanceChange * 100).toFixed(0)}%`,
      triggered: balanceChange < -0.25,
      detail: "Change over 6 months. Triggers below −25%.",
    },
    {
      key: "concentration",
      label: "Customer concentration",
      value: `${(latest.topCustomerShare * 100).toFixed(0)}% top customer`,
      triggered: concentrationUp > 0.08 || latest.topCustomerShare > 0.5,
      detail: "Triggers if top-customer share rose >8 pts or exceeds 50%.",
    },
    {
      key: "debt",
      label: "Debt coverage",
      value: `${dscr.toFixed(2)}×`,
      triggered: dscr < 1.2,
      detail: "Latest operating cash flow ÷ monthly debt service. Triggers under 1.2×.",
    },
  ];

  const weights: Record<string, number> = {
    cashflow: 22, overdue: 18, liquidity: 20, balance: 14, concentration: 10, debt: 16,
  };
  const hit = signals.filter((s) => s.triggered);
  const score = hit.reduce((s, x) => s + weights[x.key], 0);

  // Core blueprint rule: cash flow ↓ >20% + overdue ↑ + liquidity < 1 month = high priority
  const coreRule = ["cashflow", "overdue", "liquidity"].every((k) => hit.some((h) => h.key === k));
  const level: Assessment["level"] = coreRule || score >= 50 ? "high" : score >= 20 ? "watch" : "stable";

  const explanation =
    hit.length === 0
      ? "No meaningful deterioration detected over the last 6 months."
      : `${hit.map((h) => h.label.toLowerCase()).join(" + ")} changing together over the last 6 months.`;
  const action =
    level === "high"
      ? "Prioritise human credit review this week."
      : level === "watch"
        ? "Add to watchlist; re-check at next data refresh."
        : "No action needed.";

  return { score, level, signals, explanation, action };
}
