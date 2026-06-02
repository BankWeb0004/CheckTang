import { useMemo, useState } from "react";
import { Transaction, TxType, useStore } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { HistoryList } from "@/components/expense/HistoryList";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";


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
        showClose={false}
        className="rounded-t-3xl h-[88dvh] max-h-[88dvh] p-0 flex flex-col gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetClose className="absolute right-4 top-4 z-20 h-4 w-4 p-0 flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>

        <SheetHeader className="px-6 pt-6 pb-2 shrink-0 space-y-0">
          <SheetTitle className="text-center text-base font-semibold pr-8">
            {wallet ? `${wallet.emoji} ${wallet.name}` : "—"}
          </SheetTitle>
        </SheetHeader>

        {wallet && (
          <div className="flex-1 min-h-0 grid grid-rows-[auto_minmax(0,1fr)] px-6 pb-6 overflow-hidden">
            {/* Balance + month stats — fixed top region */}
            <div className="min-h-0 space-y-3 pt-1 overflow-hidden">
              <div className="text-center py-1">
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
                  />
                </div>
              </div>

              <div className="text-sm font-medium text-foreground pt-2">
                {t.walletHistory}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {chip("all", t.filterAll)}
                {chip("income", t.income)}
                {chip("expense", t.expense)}
                {chip("transfer", t.transfer)}
              </div>
            </div>

            {/* Scrollable list — the ONLY scrolling region. Upper section stays locked. */}
            <div
              className="min-h-0 h-full overflow-y-auto mt-2 -mx-1 px-1"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                contain: "layout style",
              }}
            >
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

