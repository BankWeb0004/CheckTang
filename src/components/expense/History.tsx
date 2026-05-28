import { useMemo } from "react";
import {
  useStore,
  Transaction,
  getCategoryLabel,
} from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, ArrowRightLeft } from "lucide-react";

function formatDateLabel(
  iso: string,
  lang: "en" | "th",
  t: ReturnType<typeof useStore>["t"]
) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
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
  const { transactions, t, lang, deleteTransaction, getWalletById } = useStore();

  const grouped = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
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
        // Day total: transfers are wallet-internal and don't change net worth
        const dayTotal = items.reduce((s, tx) => {
          if (tx.type === "income") return s + tx.amount;
          if (tx.type === "expense") return s - tx.amount;
          return s;
        }, 0);
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {formatDateLabel(date, lang, t)}
              </div>
              <div
                className="text-xs font-medium"
                style={{
                  color: dayTotal < 0 ? "var(--expense)" : "var(--income)",
                }}
              >
                <SmartAmount value={dayTotal} colorize={false} className="text-xs font-medium" />
              </div>
            </div>
            <Card className="card-soft divide-y divide-border overflow-hidden">
              {items.map((tx) => {
                const isInc = tx.type === "income";
                const isTrans = tx.type === "transfer";
                const color = isTrans
                  ? "var(--primary)"
                  : isInc
                    ? "var(--income)"
                    : "var(--expense)";
                const fromW = getWalletById(tx.wallet_id);
                const toW = tx.to_wallet_id ? getWalletById(tx.to_wallet_id) : null;
                const catLabel = isTrans
                  ? t.transfer
                  : getCategoryLabel(tx.category_name, t.categories);

                return (
                  <div key={tx.id} className="flex items-center gap-3 p-4 group">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-medium"
                      style={{
                        background: `color-mix(in oklab, ${color} 18%, transparent)`,
                        color,
                      }}
                    >
                      {isTrans ? (
                        <ArrowRightLeft className="h-4 w-4" />
                      ) : tx.category_emoji ? (
                        <span>{tx.category_emoji}</span>
                      ) : isInc ? (
                        "+"
                      ) : (
                        "−"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-foreground">
                        {catLabel}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {isTrans && toW
                          ? `${fromW?.emoji ?? ""} ${fromW?.name ?? "—"} → ${toW.emoji} ${toW.name}`
                          : `${fromW?.emoji ?? ""} ${fromW?.name ?? "—"}`}
                        {tx.note ? ` · ${tx.note}` : ""}
                      </div>
                    </div>
                    <div
                      className="text-sm font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {isTrans ? "" : isInc ? "+" : "−"}
                      <SmartAmount value={tx.amount} colorize={false} className="text-sm font-semibold" />
                    </div>
                    <div className="flex items-center gap-1">
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
