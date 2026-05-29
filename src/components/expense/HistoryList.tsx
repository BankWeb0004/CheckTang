import { useMemo, useRef, useState } from "react";
import { Transaction, useStore } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  onEdit?: (tx: Transaction) => void;
  hideWalletBadge?: boolean;
  emptyText?: string;
}

const MAX_SWIPE = 80;

function groupByDate(items: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  // sort newest first
  const sorted = [...items].sort((a, b) => {
    if (a.date === b.date) return b.createdAt - a.createdAt;
    return a.date < b.date ? 1 : -1;
  });
  for (const tx of sorted) {
    const k = tx.date;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(tx);
  }
  return groups;
}

function formatDateHeader(dateStr: string, lang: "th" | "en", t: ReturnType<typeof useStore>["t"]) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  const eq = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (eq(d, today)) return t.today;
  if (eq(d, yest)) return t.yesterday;
  return d.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    weekday: "short",
  });
}

function HistoryRow({
  tx,
  onEdit,
  hideWalletBadge,
}: {
  tx: Transaction;
  onEdit?: (tx: Transaction) => void;
  hideWalletBadge?: boolean;
}) {
  const { wallets, deleteTransaction, t, lang } = useStore();
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const fromWallet = wallets.find((w) => w.id === tx.wallet_id);
  const toWallet = wallets.find((w) => w.id === tx.to_wallet_id);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (dx < 0) {
      setOffset(Math.max(dx, -MAX_SWIPE));
    } else if (offset < 0) {
      setOffset(Math.min(0, offset + dx));
    }
  };
  const onPointerUp = () => {
    if (offset < -MAX_SWIPE / 2) setOffset(-MAX_SWIPE);
    else setOffset(0);
    startX.current = null;
  };

  const displayAmount =
    tx.type === "income" ? tx.amount : tx.type === "expense" ? -tx.amount : tx.amount;

  const title =
    tx.type === "transfer"
      ? `${fromWallet?.name ?? "?"} → ${toWallet?.name ?? "?"}`
      : tx.category_name
      ? tx.category_name === "Transfer" || tx.category_name === "โอนเงิน"
        ? tx.note || tx.category_name
        : `${tx.category_emoji ? tx.category_emoji + " " : ""}${
            t.categories[tx.category_name] ?? tx.category_name
          }`
      : tx.note || "—";

  return (
    <div className="relative overflow-hidden">
      {/* Hidden actions */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-1 pr-1"
        style={{ width: MAX_SWIPE }}
      >
        <button
          onClick={() => onEdit?.(tx)}
          className="h-9 w-9 rounded-lg bg-muted text-foreground flex items-center justify-center"
          aria-label="edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (window.confirm(t.confirmDelete)) {
              deleteTransaction(tx.id);
              toast.success(lang === "th" ? "ลบแล้ว" : "Deleted");
            }
          }}
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--expense)", color: "#fff" }}
          aria-label="delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Row */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (offset === 0) {
            // simple tap reveals actions on touch; on click toggles
            setOffset(offset < 0 ? 0 : -MAX_SWIPE);
          } else {
            setOffset(0);
          }
        }}
        onDoubleClick={() => onEdit?.(tx)}
        className="flex items-center gap-2.5 px-3 py-2 bg-card cursor-pointer select-none transition-transform"
        style={{ transform: `translateX(${offset}px)` }}
      >
        <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center text-base">
          {tx.type === "transfer" ? "🔁" : tx.category_emoji || "🏷️"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-foreground truncate leading-tight">
            {title}
            {tx.note && tx.type !== "transfer" && (
              <span className="text-muted-foreground font-normal"> · {tx.note}</span>
            )}
          </div>
          {!hideWalletBadge && (
            <div className="text-[10px] text-muted-foreground opacity-60 truncate">
              {fromWallet?.name ?? "?"}
            </div>
          )}
          {hideWalletBadge && tx.type === "transfer" && (
            <div className="text-[10px] text-muted-foreground opacity-60">
              {toWallet ? `→ ${toWallet.name}` : ""}
            </div>
          )}
        </div>
        <div className="text-right">
          <SmartAmount
            value={displayAmount}
            className="text-[13px] font-semibold"
            colorize
          />
        </div>
      </div>
    </div>
  );
}

export function HistoryList({ transactions, onEdit, hideWalletBadge, emptyText }: Props) {
  const { lang, t } = useStore();
  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        {emptyText ?? t.noTransactions}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from(groups.entries()).map(([dateStr, items]) => {
        const dayTotal = items.reduce((s, tx) => {
          if (tx.type === "income") return s + tx.amount;
          if (tx.type === "expense") return s - tx.amount;
          return s;
        }, 0);
        return (
          <div key={dateStr} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatDateHeader(dateStr, lang, t)}
              </span>
              <SmartAmount
                value={dayTotal}
                className="text-[11px] font-medium text-muted-foreground"
                colorize
              />
            </div>
            <div className="divide-y divide-border">
              {items.map((tx) => (
                <HistoryRow
                  key={tx.id}
                  tx={tx}
                  onEdit={onEdit}
                  hideWalletBadge={hideWalletBadge}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
