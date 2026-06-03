import { useMemo, useState } from "react";
import { useStore, getCategoryLabel, DEFAULT_CATEGORY_EMOJI, ADJUSTMENT_CATEGORY } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { MonthPicker, nowMonth, isTxInMonth } from "@/components/expense/MonthPicker";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDownLeft, ArrowUpRight, Wallet, PiggyBank } from "lucide-react";

const CHART_COLORS = [
  "oklch(0.65 0.18 30)",
  "oklch(0.68 0.16 90)",
  "oklch(0.65 0.18 155)",
  "oklch(0.62 0.18 220)",
  "oklch(0.65 0.16 280)",
  "oklch(0.65 0.18 340)",
  "oklch(0.7 0.15 60)",
  "oklch(0.6 0.18 200)",
];

interface CategoryRow {
  name: string;
  value: number;
  emoji: string;
  label: string;
}

export function Dashboard() {
  const { transactions, t, netWorth } = useStore();
  const [month, setMonth] = useState(() => nowMonth());

  const { incomeMonth, expenseMonth, byCategoryExpense, total } = useMemo(() => {
    const inMonth = transactions.filter((tx) => isTxInMonth(tx.date, month));
    const inc = inMonth
      .filter((tx) => tx.type === "income")
      .reduce((s, tx) => s + tx.amount, 0);
    const exp = inMonth
      .filter((tx) => tx.type === "expense")
      .reduce((s, tx) => s + tx.amount, 0);

    const cats: Record<string, { value: number; emoji: string }> = {};
    inMonth
      .filter((tx) => tx.type === "expense" && tx.category_name !== ADJUSTMENT_CATEGORY)
      .forEach((tx) => {
        const key = tx.category_name;
        if (!cats[key]) cats[key] = { value: 0, emoji: tx.category_emoji || DEFAULT_CATEGORY_EMOJI[key] || "" };
        cats[key].value += tx.amount;
      });

    const rows: CategoryRow[] = Object.entries(cats)
      .map(([name, v]) => ({
        name,
        value: v.value,
        emoji: v.emoji,
        label: getCategoryLabel(name, t.categories),
      }))
      .sort((a, b) => b.value - a.value);

    return {
      incomeMonth: inc,
      expenseMonth: exp,
      byCategoryExpense: rows,
      total: rows.reduce((s, r) => s + r.value, 0),
    };
  }, [transactions, month, t.categories]);

  const netSavings = incomeMonth - expenseMonth;

  return (
    <div className="space-y-3">
      {/* Net worth (global, always current real-world total) */}
      <Card className="card-soft p-5">
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Wallet className="h-4 w-4" />
          <span>{t.balance}</span>
        </div>
        <div className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          <SmartAmount value={netWorth} className="text-4xl font-semibold" />
        </div>
      </Card>

      {/* Month picker */}
      <MonthPicker value={month} onChange={setMonth} />

      {/* Monthly summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="card-soft p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ArrowDownLeft className="h-3 w-3" style={{ color: "var(--income)" }} />
            <span className="truncate">{t.totalIncome}</span>
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: "var(--income)" }}>
            <SmartAmount value={incomeMonth} colorize={false} className="text-sm font-semibold" />
          </div>
        </Card>
        <Card className="card-soft p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ArrowUpRight className="h-3 w-3" style={{ color: "var(--expense)" }} />
            <span className="truncate">{t.totalExpense}</span>
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: "var(--expense)" }}>
            <SmartAmount value={expenseMonth} colorize={false} className="text-sm font-semibold" />
          </div>
        </Card>
        <Card className="card-soft p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <PiggyBank className="h-3 w-3" />
            <span className="truncate">{t.monthlySavings}</span>
          </div>
          <div
            className="mt-1 text-sm font-semibold"
            style={{ color: netSavings >= 0 ? "var(--income)" : "var(--expense)" }}
          >
            <SmartAmount value={netSavings} colorize={false} className="text-sm font-semibold" />
          </div>
        </Card>
      </div>

      {/* Pie + scrollable category list */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-4 text-foreground">
          {t.expensesByCategory}
        </div>
        {byCategoryExpense.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            {t.noData}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(180px,40%)] gap-4 items-center">
            <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5 order-2 sm:order-1">
              {byCategoryExpense.map((c, i) => {
                const pct = total > 0 ? (c.value / total) * 100 : 0;
                return (
                  <div
                    key={c.name}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {c.emoji && <span className="text-base leading-none">{c.emoji}</span>}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">
                        {c.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-foreground tabular-nums">
                      <SmartAmount value={c.value} colorize={false} className="text-xs font-semibold" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-56 order-1 sm:order-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategoryExpense}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {byCategoryExpense.map((_, i) => (
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
                    formatter={(v: number, _n: string, item) => {
                      const name = (item?.payload?.label as string) ?? "";
                      const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
                      return [`${v.toLocaleString()} (${pct}%)`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
