import { useEffect, useMemo, useState } from "react";
import {
  useStore,
  Transaction,
  TxType,
  getCategoryLabel,
  DEFAULT_CATEGORY_EMOJI,
} from "@/lib/expense-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction | null;
  initialWalletId?: string | null;
  initialType?: TxType;
}

export function AddTransactionSheet({
  open,
  onOpenChange,
  editTransaction,
  initialWalletId,
  initialType,
}: Props) {
  const {
    t,
    lang,
    wallets,
    addTransaction,
    updateTransaction,
    getCategoriesFor,
    addCustomCategory,
    defaultWalletId,
  } = useStore();

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<string>("");
  const [toWalletId, setToWalletId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const isEdit = !!editTransaction;

  // Hydrate when opening
  useEffect(() => {
    if (!open) return;
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setWalletId(editTransaction.wallet_id);
      setToWalletId(editTransaction.to_wallet_id ?? "");
      setCategory(editTransaction.category_name);
      setNote(editTransaction.note);
      setDate(editTransaction.date);
    } else {
      setType(initialType ?? "expense");
      setAmount("");
      setWalletId(initialWalletId || defaultWalletId || wallets[0]?.id || "");
      setToWalletId("");
      setCategory("");
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, editTransaction, initialWalletId, initialType, defaultWalletId, wallets]);

  const categories = useMemo(() => getCategoriesFor(type), [type, getCategoriesFor]);

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || isNaN(amt)) {
      toast.error(t.amountRequired);
      return;
    }
    if (!walletId) {
      toast.error(t.walletRequired);
      return;
    }
    if (type === "transfer") {
      if (!toWalletId) {
        toast.error(t.toWalletRequired);
        return;
      }
      if (toWalletId === walletId) {
        toast.error(t.sameWalletError);
        return;
      }
    } else {
      if (!category) {
        toast.error(t.categoryRequired);
        return;
      }
    }

    const payload = {
      wallet_id: walletId,
      to_wallet_id: type === "transfer" ? toWalletId : null,
      type,
      amount: amt,
      category_name:
        type === "transfer"
          ? lang === "th"
            ? "โอนเงิน"
            : "Transfer"
          : category,
      category_emoji:
        type === "transfer"
          ? "🔁"
          : DEFAULT_CATEGORY_EMOJI[category] ??
            (category.match(/\p{Emoji}/u)?.[0] ?? ""),
      note,
      date,
    };

    if (isEdit && editTransaction) {
      updateTransaction(editTransaction.id, payload);
      toast.success(lang === "th" ? "บันทึกการแก้ไขแล้ว" : "Updated");
    } else {
      addTransaction(payload);
      toast.success(lang === "th" ? "บันทึกแล้ว" : "Saved");
    }

    onOpenChange(false);
  };

  const handleAddCategory = () => {
    if (type === "transfer") return;
    const name = window.prompt(t.newCategoryPrompt);
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const ok = addCustomCategory(type, trimmed);
    if (ok) {
      setCategory(trimmed);
      toast.success(lang === "th" ? "เพิ่มหมวดหมู่แล้ว" : "Category added");
    } else {
      toast.error(lang === "th" ? "ไม่สำเร็จ" : "Could not add");
    }
  };

  const typeBtn = (val: TxType, icon: React.ReactNode, label: string, color: string) => {
    const active = type === val;
    return (
      <button
        type="button"
        onClick={() => setType(val)}
        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
        style={{
          background: active ? color : "transparent",
          color: active ? "#fff" : "var(--muted-foreground)",
          boxShadow: active ? "0 4px 12px -4px " + color : "none",
        }}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-base font-semibold">
            {isEdit ? t.editTransaction : t.addTransaction}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-3 space-y-4 pb-6">
          {/* Type toggle */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted">
            {typeBtn(
              "expense",
              <ArrowUpRight className="h-4 w-4" />,
              t.expense,
              "var(--expense)"
            )}
            {typeBtn(
              "income",
              <ArrowDownLeft className="h-4 w-4" />,
              t.income,
              "var(--income)"
            )}
            {typeBtn(
              "transfer",
              <ArrowRightLeft className="h-4 w-4" />,
              t.transfer,
              "var(--primary)"
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t.amount}</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) setAmount(v);
              }}
              placeholder="0.00"
              className="h-14 text-2xl font-semibold rounded-2xl text-center"
              autoFocus
            />
          </div>

          {/* Wallets */}
          <div className={`grid gap-3 ${type === "transfer" ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="space-y-1.5">
              <Label className="text-xs">
                {type === "transfer" ? t.fromWallet : t.wallet}
              </Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.emoji} {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "transfer" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t.toWallet}</Label>
                <Select value={toWalletId} onValueChange={setToWalletId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets
                      .filter((w) => w.id !== walletId)
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.emoji} {w.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Category */}
          {type !== "transfer" && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t.category}</Label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const active = cat === category;
                  const label = getCategoryLabel(cat, t.categories);
                  const emoji =
                    DEFAULT_CATEGORY_EMOJI[cat] ??
                    cat.match(/\p{Emoji}/u)?.[0] ??
                    "🏷️";
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border"
                      style={{
                        background: active ? "var(--primary)" : "var(--card)",
                        color: active ? "var(--primary-foreground)" : "var(--foreground)",
                        borderColor: active ? "var(--primary)" : "var(--border)",
                      }}
                    >
                      <span className="mr-1">{emoji}</span>
                      {label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3 inline mr-1" />
                  {t.addNewCategory}
                </button>
              </div>
            </div>
          )}

          {/* Date + Note */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t.date}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                {t.note} <span className="text-muted-foreground">({t.optional})</span>
              </Label>
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button className="flex-1 h-12 rounded-xl text-base font-semibold" onClick={submit}>
              {t.save}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AddTransactionSheet;
