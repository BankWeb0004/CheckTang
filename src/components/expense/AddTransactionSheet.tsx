import { useState, useCallback, useMemo, useEffect } from "react";
import {
  useStore,
  TxType,
  Transaction,
  NewTransactionInput,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRightLeft, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editTransaction?: Transaction | null;
  /** Optional preselected source wallet (e.g. from WalletsPane quick action) */
  initialWalletId?: string | null;
}

interface TxRow {
  id: string;
  walletId: string;
  toWalletId: string;
  amount: string;
  displayAmount: string;
  category: string;
  categoryEmoji: string;
  note: string;
  date: string;
}

const ADD_CATEGORY_SENTINEL = "__add_new_category__";

function formatWithCommas(value: string): string {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}
const removeCommas = (v: string) => v.replace(/,/g, "");

function makeEmptyRow(defaultWalletId: string): TxRow {
  return {
    id: crypto.randomUUID(),
    walletId: defaultWalletId,
    toWalletId: "",
    amount: "",
    displayAmount: "",
    category: "",
    categoryEmoji: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export function AddTransactionSheet({
  open,
  onOpenChange,
  editTransaction,
  initialWalletId,
}: Props) {
  const {
    t,
    wallets,
    defaultWalletId,
    addTransactions,
    updateTransaction,
    getCategoriesFor,
    addCustomCategory,
  } = useStore();

  const [type, setType] = useState<TxType>("expense");
  const [rows, setRows] = useState<TxRow[]>(() => [
    makeEmptyRow(initialWalletId || defaultWalletId),
  ]);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catDialogRowId, setCatDialogRowId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("");

  const categoryOptions = useMemo(() => {
    if (type === "transfer") return [];
    return getCategoriesFor(type).map((c) => ({
      key: c,
      label: getCategoryLabel(c, t.categories),
      emoji: DEFAULT_CATEGORY_EMOJI[c] ?? "",
    }));
  }, [type, getCategoriesFor, t.categories]);

  const reset = useCallback(() => {
    setType("expense");
    setRows([makeEmptyRow(initialWalletId || defaultWalletId)]);
  }, [defaultWalletId, initialWalletId]);

  useEffect(() => {
    if (open && editTransaction) {
      setType(editTransaction.type);
      setRows([
        {
          id: editTransaction.id,
          walletId: editTransaction.wallet_id,
          toWalletId: editTransaction.to_wallet_id ?? "",
          amount: String(editTransaction.amount),
          displayAmount: formatWithCommas(String(editTransaction.amount)),
          category: editTransaction.category_name,
          categoryEmoji: editTransaction.category_emoji ?? "",
          note: editTransaction.note,
          date: editTransaction.date,
        },
      ]);
      return;
    }
    if (open && !editTransaction) {
      reset();
      return;
    }
    if (!open && !editTransaction) {
      reset();
    }
  }, [open, editTransaction, reset]);

  // Reset categories when toggling type since lists differ
  useEffect(() => {
    if (type === "transfer") return;
    const valid = new Set(getCategoriesFor(type));
    setRows((prev) =>
      prev.map((r) =>
        r.category && !valid.has(r.category) ? { ...r, category: "", categoryEmoji: "" } : r
      )
    );
  }, [type, getCategoriesFor]);

  const updateRow = (rowId: string, patch: Partial<TxRow>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  };

  const handleAmountChange = (rowId: string, value: string) => {
    const clean = removeCommas(value);
    if (clean && !/^\d*\.?\d*$/.test(clean)) return;
    updateRow(rowId, { amount: clean, displayAmount: formatWithCommas(clean) });
  };

  const handleCategoryChange = (rowId: string, value: string) => {
    if (value === ADD_CATEGORY_SENTINEL) {
      setCatDialogRowId(rowId);
      setNewCatName("");
      setNewCatEmoji("");
      setCatDialogOpen(true);
      return;
    }
    updateRow(rowId, {
      category: value,
      categoryEmoji: DEFAULT_CATEGORY_EMOJI[value] ?? "",
    });
  };

  const handleConfirmNewCategory = () => {
    if (type === "transfer") return;
    const name = newCatName.trim();
    if (!name) {
      toast.error(t.newCategoryPrompt);
      return;
    }
    const ok = addCustomCategory(type, name);
    if (!ok) {
      toast.error(t.newCategoryPrompt);
      return;
    }
    if (catDialogRowId) {
      updateRow(catDialogRowId, {
        category: name,
        categoryEmoji: newCatEmoji.trim().slice(0, 8),
      });
    }
    setCatDialogOpen(false);
    setCatDialogRowId(null);
    setNewCatName("");
    setNewCatEmoji("");
  };

  const addRow = () =>
    setRows((prev) => [...prev, makeEmptyRow(initialWalletId || defaultWalletId)]);
  const removeRow = (rowId: string) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const isEditing = Boolean(editTransaction?.id);

  const submit = () => {
    if (!wallets.length) {
      toast.error(t.walletRequired);
      return;
    }
    const items: NewTransactionInput[] = [];

    for (const row of rows) {
      if (!row.amount.trim()) continue;
      const num = parseFloat(removeCommas(row.amount));
      if (isNaN(num) || num <= 0) {
        toast.error(t.amountRequired);
        return;
      }
      if (!row.walletId) {
        toast.error(t.walletRequired);
        return;
      }
      if (type === "transfer") {
        if (!row.toWalletId) {
          toast.error(t.toWalletRequired);
          return;
        }
        if (row.toWalletId === row.walletId) {
          toast.error(t.sameWalletError);
          return;
        }
      } else if (!row.category) {
        toast.error(t.categoryRequired);
        return;
      }

      items.push({
        wallet_id: row.walletId,
        to_wallet_id: type === "transfer" ? row.toWalletId : null,
        type,
        amount: num,
        category_name:
          type === "transfer" ? (t.transfer as string) : row.category,
        category_emoji:
          type === "transfer" ? "🔁" : row.categoryEmoji || "",
        note: row.note,
        date: row.date,
      });
    }

    if (!items.length) {
      toast.error(t.amountRequired);
      return;
    }

    if (isEditing && editTransaction) {
      const first = items[0];
      updateTransaction(editTransaction.id, {
        wallet_id: first.wallet_id,
        to_wallet_id: first.to_wallet_id,
        type: first.type,
        amount: first.amount,
        category_name: first.category_name,
        category_emoji: first.category_emoji,
        note: first.note,
        date: first.date,
      });
    } else {
      addTransactions(items);
    }

    reset();
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border max-h-[92vh] overflow-y-auto bg-card will-change-transform"
          style={{ transform: "translateZ(0)" }}
        >
          <SheetHeader>
            <SheetTitle className="text-center">
              {isEditing ? t.editTransaction : t.addTransaction}
              {!isEditing && rows.length > 1 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({rows.length} {t.itemCount})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-2 space-y-5 pb-6 px-1">
            {/* Type Toggle */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-muted gap-1">
              {(
                [
                  { id: "expense" as TxType, label: t.expense, icon: ArrowUpRight, color: "var(--expense)" },
                  { id: "income" as TxType, label: t.income, icon: ArrowDownLeft, color: "var(--income)" },
                  { id: "transfer" as TxType, label: t.transfer, icon: ArrowRightLeft, color: "var(--primary)" },
                ]
              ).map(({ id, label, icon: Icon, color }) => {
                const active = type === id;
                return (
                  <button
                    key={id}
                    onClick={() => setType(id)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: active ? "var(--card)" : "transparent",
                      color: active ? color : "var(--muted-foreground)",
                      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Rows */}
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="relative p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-4"
                >
                  {rows.length > 1 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>{t.amount}</Label>
                    <Input
                      inputMode="decimal"
                      type="text"
                      value={row.displayAmount}
                      onChange={(e) => handleAmountChange(row.id, e.target.value)}
                      placeholder="0.00"
                      className="text-2xl h-14 rounded-2xl"
                    />
                  </div>

                  {/* Wallets */}
                  <div className={type === "transfer" ? "grid grid-cols-2 gap-3" : ""}>
                    <div className="space-y-1.5">
                      <Label>{type === "transfer" ? t.fromWallet : t.wallet}</Label>
                      <Select
                        value={row.walletId || undefined}
                        onValueChange={(v) => updateRow(row.id, { walletId: v })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t.wallet} />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              <span className="inline-flex items-center gap-2">
                                <span>{w.emoji}</span>
                                {w.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {type === "transfer" && (
                      <div className="space-y-1.5">
                        <Label>{t.toWallet}</Label>
                        <Select
                          value={row.toWalletId || undefined}
                          onValueChange={(v) => updateRow(row.id, { toWalletId: v })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder={t.toWallet} />
                          </SelectTrigger>
                          <SelectContent>
                            {wallets
                              .filter((w) => w.id !== row.walletId)
                              .map((w) => (
                                <SelectItem key={w.id} value={w.id}>
                                  <span className="inline-flex items-center gap-2">
                                    <span>{w.emoji}</span>
                                    {w.name}
                                  </span>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {type !== "transfer" && (
                    <div className="grid grid-cols-[1fr_5rem] gap-3">
                      <div className="space-y-1.5">
                        <Label>{t.category}</Label>
                        <Select
                          value={row.category || undefined}
                          onValueChange={(v) => handleCategoryChange(row.id, v)}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder={t.selectCategory} />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((opt) => (
                              <SelectItem key={opt.key} value={opt.key}>
                                <span className="inline-flex items-center gap-2">
                                  {opt.emoji && <span>{opt.emoji}</span>}
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                            <SelectItem
                              value={ADD_CATEGORY_SENTINEL}
                              className="text-primary font-medium"
                            >
                              <span className="flex items-center gap-1.5">
                                <Plus className="h-3.5 w-3.5" />
                                {t.addNewCategory}
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t.walletEmoji}</Label>
                        <Input
                          value={row.categoryEmoji}
                          onChange={(e) =>
                            updateRow(row.id, {
                              categoryEmoji: e.target.value.slice(0, 8),
                            })
                          }
                          placeholder={t.emojiPlaceholder}
                          className="rounded-xl text-center text-lg"
                          maxLength={8}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>{t.date}</Label>
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, { date: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>
                      {t.note}{" "}
                      <span className="text-xs text-muted-foreground">({t.optional})</span>
                    </Label>
                    <Textarea
                      value={row.note}
                      onChange={(e) => updateRow(row.id, { note: e.target.value })}
                      rows={2}
                      className="rounded-xl resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {!isEditing && (
              <Button
                variant="outline"
                onClick={addRow}
                className="w-full rounded-xl h-11 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.addAnother}
              </Button>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-11"
              >
                {t.cancel}
              </Button>
              <Button onClick={submit} className="flex-1 rounded-xl h-11">
                {t.save}
                {rows.length > 1 && (
                  <span className="ml-1.5 text-xs opacity-80">({rows.length})</span>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Custom category dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.addNewCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-[5rem_1fr] gap-2 items-end">
              <div className="space-y-1.5">
                <Label>{t.walletEmoji}</Label>
                <Input
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value.slice(0, 8))}
                  placeholder={t.emojiPlaceholder}
                  className="rounded-xl h-11 text-center text-lg"
                  maxLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-cat-name">{t.newCategoryPrompt}</Label>
                <Input
                  id="new-cat-name"
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t.newCategoryPlaceholder}
                  maxLength={40}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmNewCategory();
                    }
                  }}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setCatDialogOpen(false)}
              className="rounded-xl"
            >
              {t.cancel}
            </Button>
            <Button onClick={handleConfirmNewCategory} className="rounded-xl">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
