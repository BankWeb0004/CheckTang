import { useMemo, useState } from "react";
import { Transaction, TxType, useStore } from "@/lib/expense-store";
import { HistoryList } from "@/components/expense/HistoryList";
import { MonthPicker, nowMonth, isTxInMonth } from "@/components/expense/MonthPicker";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Search } from "lucide-react";

interface Props {
  onEdit?: (tx: Transaction) => void;
}

type Filter = "all" | TxType;

export function History({ onEdit }: Props) {
  const { transactions, t, wallets, lang } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [month, setMonth] = useState(() => nowMonth());

  const inMonth = useMemo(
    () => transactions.filter((tx) => isTxInMonth(tx.date, month)),
    [transactions, month]
  );

  const { incomeTotal, expenseTotal } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    inMonth.forEach((tx) => {
      if (tx.type === "income") inc += tx.amount;
      else if (tx.type === "expense") exp += tx.amount;
    });
    return { incomeTotal: inc, expenseTotal: exp };
  }, [inMonth]);
  const netSavings = incomeTotal - expenseTotal;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inMonth.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (!q) return true;
      const walletName = wallets.find((w) => w.id === tx.wallet_id)?.name ?? "";
      return (
        tx.note.toLowerCase().includes(q) ||
        tx.category_name.toLowerCase().includes(q) ||
        walletName.toLowerCase().includes(q)
      );
    });
  }, [inMonth, filter, search, wallets]);

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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold text-foreground">{t.history}</h1>
        <span className="text-[11px] text-muted-foreground">
          {filtered.length} {t.itemCount}
        </span>
      </div>

      <MonthPicker value={month} onChange={setMonth} />

      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="card-soft p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ArrowDownLeft className="h-3 w-3" style={{ color: "var(--income)" }} />
            <span className="truncate">{t.totalIncome}</span>
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: "var(--income)" }}>
            <SmartAmount value={incomeTotal} colorize={false} className="text-sm font-semibold" />
          </div>
        </Card>
        <Card className="card-soft p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ArrowUpRight className="h-3 w-3" style={{ color: "var(--expense)" }} />
            <span className="truncate">{t.totalExpense}</span>
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: "var(--expense)" }}>
            <SmartAmount value={expenseTotal} colorize={false} className="text-sm font-semibold" />
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "th" ? "ค้นหา..." : "Search..."}
          className="h-10 pl-9 rounded-xl text-sm"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
        {chip("all", t.filterAll)}
        {chip("income", t.income)}
        {chip("expense", t.expense)}
        {chip("transfer", t.transfer)}
      </div>

      <HistoryList transactions={filtered} onEdit={onEdit} />
    </div>
  );
}
