import { useMemo } from "react";
import { useStore, formatCurrency, Transaction } from "@/lib/expense-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";

function formatDateLabel(iso: string, lang: "en" | "th", t: ReturnType<typeof useStore>["t"]) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return t.today;
  if (sameDay(d, yest)) return t.yesterday;
  return d.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  onEdit?: (tx: Transaction) => void;
}

export function History({ onEdit }: Props) {
  const { transactions, t, lang, currency, deleteTransaction } = useStore();

  const grouped = useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date) || b.createdAt - a.createdAt
    );
    const map = new Map<string, Transaction[]>();
    sorted.forEach((tx) => {
      const arr = map.get(tx.date) ?? [];
      arr.push(tx);
      map.set(tx.date, arr);
    });
    return Array.from(map.entries());
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card className="card-soft p-8 text-center text-sm text-muted-foreground">
        {t.noTransactions}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, items]) => {
        const dayTotal = items.reduce(
          (s, tx) => s + (tx.type === "income" ? tx.amount : -tx.amount),
          0
        );
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {formatDateLabel(date, lang, t)}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: dayTotal < 0 ? "var(--expense)" : "var(--income)" }}
              >
                {formatCurrency(dayTotal, lang, currency)}
              </div>
            </div>
            <Card className="card-soft divide-y divide-border overflow-hidden">
              {items.map((tx) => {
                const isInc = tx.type === "income";
                const color = isInc ? "var(--income)" : "var(--expense)";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-4 group"
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium"
                      style={{
                        background: isInc
                          ? "color-mix(in oklab, var(--income) 18%, transparent)"
                          : "color-mix(in oklab, var(--expense) 18%, transparent)",
                        color,
                      }}
                    >
                      {isInc ? "+" : "−"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {t.categories[tx.category as keyof typeof t.categories] ?? tx.category}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.methods[tx.method as keyof typeof t.methods] ?? tx.method}
                        {tx.note ? ` · ${tx.note}` : ""}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums" style={{ color }}>
                      {isInc ? "+" : "−"}
                      {formatCurrency(tx.amount, lang, currency).replace("-", "")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-40 hover:opacity-100"
                        onClick={() => onEdit?.(tx)}
                        aria-label={t.editTransaction}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-40 hover:opacity-100"
                        onClick={() => {
                          if (confirm(t.confirmDelete)) deleteTransaction(tx.id);
                        }}
                        aria-label={t.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
