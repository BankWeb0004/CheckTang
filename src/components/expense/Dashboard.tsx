import { useMemo } from "react";
import { useStore, formatCurrency } from "@/lib/expense-store";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { CheckTangLogo } from "@/components/expense/CheckTangLogo";

const CHART_COLORS = [
  "oklch(0.65 0.18 30)",
  "oklch(0.68 0.16 90)",
  "oklch(0.65 0.18 155)",
  "oklch(0.62 0.18 220)",
  "oklch(0.65 0.16 280)",
  "oklch(0.65 0.18 340)",
];

export function Dashboard() {
  const { transactions, t, lang, currency } = useStore();

  const { income, expense, balance, byCategory } = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const thisMonth = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    const inc = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalInc = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExp = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const cats: Record<string, number> = {};
    thisMonth
      .filter((t) => t.type === "expense")
      .forEach((t) => (cats[t.category] = (cats[t.category] ?? 0) + t.amount));
    const byCategory = Object.entries(cats).map(([name, value]) => ({ name, value }));
    return { income: inc, expense: exp, balance: totalInc - totalExp, byCategory };
  }, [transactions]);

  const balanceNegative = balance < 0;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.72rem] font-medium tracking-[0.08em] text-foreground">
          {dateLabel}
        </p>
        <div className="flex items-center gap-3">
          <CheckTangLogo className="text-foreground" showLabel={false} />
          <div className="flex flex-col items-end gap-0.5 text-right">
            <span className="text-sm font-semibold leading-none text-foreground">
              เช็คตังค์
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.25em] text-foreground opacity-70">
              CHECK TANG
            </span>
          </div>
        </div>
      </div>

      <Card className="card-soft p-6">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <Wallet className="h-4 w-4" />
          <span>{t.balance}</span>
        </div>
        <div
          className="mt-2 text-4xl font-semibold tracking-tight text-foreground"
          style={{ color: balanceNegative ? "var(--expense)" : "var(--foreground)" }}
        >
          {formatCurrency(balance, lang, currency)}
        </div>
        <div className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>{t.thisMonth}</div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="card-soft p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowDownLeft className="h-3.5 w-3.5" style={{ color: "var(--income)" }} />
            {t.income}
          </div>
          <div className="mt-1.5 text-lg font-semibold" style={{ color: "var(--income)" }}>
            {formatCurrency(income, lang, currency)}
          </div>
        </Card>
        <Card className="card-soft p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" style={{ color: "var(--expense)" }} />
            {t.expense}
          </div>
          <div className="mt-1.5 text-lg font-semibold" style={{ color: "var(--expense)" }}>
            {formatCurrency(expense, lang, currency)}
          </div>
        </Card>
      </div>

      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-4 text-foreground">{t.expensesByCategory}</div>
        {byCategory.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            {t.noData}
          </div>
        ) : (
          <div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--foreground)",
                      padding: "0.75rem 0.9rem",
                    }}
                    itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                    formatter={(v: number, n: string) => [
                      formatCurrency(v, lang, currency),
                      t.categories[n as keyof typeof t.categories] ?? n,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-3 pb-2">
              {byCategory.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {t.categories[c.name as keyof typeof t.categories] ?? c.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
