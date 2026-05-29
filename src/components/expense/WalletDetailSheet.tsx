import { useMemo, useState } from "react";
import { Transaction, TxType, useStore } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { HistoryList } from "@/components/expense/HistoryList";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  walletId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (tx: Transaction) => void;
}

type Filter = "all" | TxType;

export function WalletDetailSheet({ walletId, open, onOpenChange, onEdit }: Props) {
  const { walletsWithBalance, transactions, t } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const wallet = walletsWithBalance.find((w) => w.id === walletId);

  const walletTxs = useMemo(() => {
    if (!walletId) return [];
    return transactions.filter(
      (tx) => tx.wallet_id === walletId || tx.to_wallet_id === walletId
    );
  }, [transactions, walletId]);

  const { incomeMonth, expenseMonth } = useMemo(() => {
    if (!walletId) return { incomeMonth: 0, expenseMonth: 0 };
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    let inc = 0;
    let exp = 0;
    walletTxs.forEach((tx) => {
      const d = new Date(tx.date + "T00:00:00");
      if (d.getMonth() !== m || d.getFullYear() !== y) return;
      if (tx.type === "income" && tx.wallet_id === walletId) inc += tx.amount;
      else if (tx.type === "expense" && tx.wallet_id === walletId) exp += tx.amount;
      else if (tx.type === "transfer") {
        if (tx.to_wallet_id === walletId) inc += tx.amount;
        if (tx.wallet_id === walletId) exp += tx.amount;
      }
    });
    return { incomeMonth: inc, expenseMonth: exp };
  }, [walletTxs, walletId]);

  const filtered = useMemo(() => {
    if (filter === "all") return walletTxs;
    return walletTxs.filter((tx) => tx.type === filter);
  }, [walletTxs, filter]);

  const chip = (key: Filter, label: string) => {
    const active = filter === key;
    return (
      <button
        key={key}
        onClick={() => setFilter(key)}
        className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border whitespace-nowrap"
        style={{
          background: active ? "var(--primary)" : "var(--card)",
          color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
          borderColor: active ? "var(--primary)" : "var(--border)",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[92vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-center text-base font-semibold">
            {wallet ? `${wallet.emoji} ${wallet.name}` : "—"}
          </SheetTitle>
        </SheetHeader>

        {wallet && (
          <div className="space-y-4 pt-2 pb-6">
            {/* Balance + month stats */}
            <div className="text-center py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {t.balance}
              </div>
              <SmartAmount value={wallet.balance} className="text-3xl font-semibold" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-border p-3 bg-card">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ArrowDownLeft className="h-3.5 w-3.5" style={{ color: "var(--income)" }} />
                  {t.monthlyIncome}
                </div>
                <SmartAmount
                  value={incomeMonth}
                  colorize={false}
                  className="text-base font-semibold mt-0.5"
                />
              </div>
              <div className="rounded-2xl border border-border p-3 bg-card">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ArrowUpRight className="h-3.5 w-3.5" style={{ color: "var(--expense)" }} />
                  {t.monthlyExpense}
                </div>
                <SmartAmount
                  value={expenseMonth}
                  colorize={false}
                  className="text-base font-semibold mt-0.5"
                  decimalClassName=""
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-2">{t.walletHistory}</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
                {chip("all", t.filterAll)}
                {chip("income", t.income)}
                {chip("expense", t.expense)}
                {chip("transfer", t.transfer)}
              </div>
              <HistoryList
                transactions={filtered}
                onEdit={onEdit}
                hideWalletBadge
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
