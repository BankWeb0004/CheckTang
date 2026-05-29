import { useMemo, useState } from "react";
import { Transaction, TxType, useStore } from "@/lib/expense-store";
import { HistoryList } from "@/components/expense/HistoryList";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  onEdit?: (tx: Transaction) => void;
}

type Filter = "all" | TxType;

export function History({ onEdit }: Props) {
  const { transactions, t, wallets, lang } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (!q) return true;
      const walletName = wallets.find((w) => w.id === tx.wallet_id)?.name ?? "";
      return (
        tx.note.toLowerCase().includes(q) ||
        tx.category_name.toLowerCase().includes(q) ||
        walletName.toLowerCase().includes(q)
      );
    });
  }, [transactions, filter, search, wallets]);

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
