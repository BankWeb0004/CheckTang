import { useState, useCallback, useMemo, useEffect } from "react";
import {
  useStore,
  METHOD_KEYS,
  TxType,
  Transaction,
  getCategoryLabel,
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
import { Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editTransaction?: Transaction | null;
}

interface TransactionRow {
  id: string;
  amount: string;
  displayAmount: string;
  category: string;
  method: string;
  note: string;
  date: string;
}

const ADD_CATEGORY_SENTINEL = "__add_new_category__";

function formatWithCommas(value: string): string {
  const cleanValue = value.replace(/[^\d.]/g, "");
  const parts = cleanValue.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}

function removeCommas(value: string): string {
  return value.replace(/,/g, "");
}

function createEmptyRow(): TransactionRow {
  return {
    id: crypto.randomUUID(),
    amount: "",
    displayAmount: "",
    category: "",
    method: "Cash",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export function AddTransactionSheet({ open, onOpenChange, editTransaction }: Props) {
  const { t, addTransactions, updateTransaction, getCategoriesFor, addCustomCategory } =
    useStore();
  const [type, setType] = useState<TxType>("expense");
  const [rows, setRows] = useState<TransactionRow[]>(() => [createEmptyRow()]);

  // Custom category dialog state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catDialogRowId, setCatDialogRowId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");

  const categoryOptions = useMemo(
    () =>
      getCategoriesFor(type).map((c) => ({
        key: c,
        label: getCategoryLabel(c, t.categories),
      })),
    [type, getCategoriesFor, t.categories]
  );

  const methodOptions = useMemo(
    () => METHOD_KEYS.map((m) => ({ key: m, label: t.methods[m] })),
    [t.methods]
  );

  const reset = useCallback(() => {
    setType("expense");
    setRows([createEmptyRow()]);
  }, []);

  useEffect(() => {
    if (open && editTransaction) {
      setType(editTransaction.type);
      setRows([
        {
          id: editTransaction.id,
          amount: String(editTransaction.amount),
          displayAmount: formatWithCommas(String(editTransaction.amount)),
          category: editTransaction.category,
          method: editTransaction.method,
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

  // When switching type, clear category in each row if it isn't valid for the new type
  useEffect(() => {
    const valid = new Set(getCategoriesFor(type));
    setRows((prev) =>
      prev.map((r) => (r.category && !valid.has(r.category) ? { ...r, category: "" } : r))
    );
  }, [type, getCategoriesFor]);

  const handleAmountChange = (rowId: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const cleanValue = removeCommas(value);
        if (cleanValue && !/^\d*\.?\d*$/.test(cleanValue)) return row;
        return {
          ...row,
          amount: cleanValue,
          displayAmount: formatWithCommas(cleanValue),
        };
      })
    );
  };

  const updateRow = (rowId: string, field: keyof TransactionRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleCategoryChange = (rowId: string, value: string) => {
    if (value === ADD_CATEGORY_SENTINEL) {
      setCatDialogRowId(rowId);
      setNewCatName("");
      setCatDialogOpen(true);
      return;
    }
    updateRow(rowId, "category", value);
  };

  const handleConfirmNewCategory = () => {
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
    if (catDialogRowId) updateRow(catDialogRowId, "category", name);
    setCatDialogOpen(false);
    setCatDialogRowId(null);
    setNewCatName("");
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (rowId: string) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const isEditing = Boolean(editTransaction?.id);

  const submit = () => {
    const validRows: Array<{
      type: TxType;
      amount: number;
      category: string;
      method: string;
      note: string;
      date: string;
    }> = [];

    for (const row of rows) {
      if (!row.amount.trim()) continue;

      const num = parseFloat(removeCommas(row.amount));
      if (isNaN(num) || num <= 0) {
        toast.error(t.amountRequired);
        return;
      }

      if (!row.category) {
        toast.error(t.categoryRequired);
        return;
      }

      validRows.push({
        type,
        amount: num,
        category: row.category,
        method: row.method,
        note: row.note,
        date: row.date,
      });
    }

    if (!validRows.length) {
      toast.error(t.amountRequired);
      return;
    }

    if (isEditing && editTransaction) {
      const row = validRows[0];
      updateTransaction(editTransaction.id, {
        type: row.type,
        amount: row.amount,
        category: row.category,
        method: row.method,
        note: row.note,
        date: row.date,
      });
    } else {
      addTransactions(validRows);
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
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted">
              <button
                onClick={() => setType("expense")}
                className="py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: type === "expense" ? "var(--card)" : "transparent",
                  color: type === "expense" ? "var(--expense)" : "var(--muted-foreground)",
                  boxShadow: type === "expense" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t.expense}
              </button>
              <button
                onClick={() => setType("income")}
                className="py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: type === "income" ? "var(--card)" : "transparent",
                  color: type === "income" ? "var(--income)" : "var(--muted-foreground)",
                  boxShadow: type === "income" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t.income}
              </button>
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

                  <div className="grid grid-cols-2 gap-3">
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
                              {opt.label}
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
                      <Label>{t.paymentMethod}</Label>
                      <Select
                        value={row.method}
                        onValueChange={(v) => updateRow(row.id, "method", v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {methodOptions.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t.date}</Label>
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, "date", e.target.value)}
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
                      onChange={(e) => updateRow(row.id, "note", e.target.value)}
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
          <div className="space-y-2 pt-2">
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
