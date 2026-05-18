import { useState, useCallback } from "react";
import { useStore, CATEGORY_KEYS, METHOD_KEYS, TxType } from "@/lib/expense-store";
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
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
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

// Format number with thousand separators
function formatWithCommas(value: string): string {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, "");
  
  // Split by decimal point
  const parts = cleanValue.split(".");
  
  // Format integer part with commas
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Return with decimal part if it exists
  if (parts.length > 1) {
    return `${integerPart}.${parts[1]}`;
  }
  
  return integerPart;
}

// Remove commas for numeric value
function removeCommas(value: string): string {
  return value.replace(/,/g, "");
}

function createEmptyRow(): TransactionRow {
  return {
    id: crypto.randomUUID(),
    amount: "",
    displayAmount: "",
    category: "Food",
    method: "Cash",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export function AddTransactionSheet({ open, onOpenChange }: Props) {
  const { t, addTransactions } = useStore();
  const [type, setType] = useState<TxType>("expense");
  const [rows, setRows] = useState<TransactionRow[]>([createEmptyRow()]);

  const reset = useCallback(() => {
    setType("expense");
    setRows([createEmptyRow()]);
  }, []);

  const handleAmountChange = (rowId: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const cleanValue = removeCommas(value);
        // Only allow valid numeric input
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

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const submit = () => {
    // Validate all rows
    const validRows: Array<{
      type: TxType;
      amount: number;
      category: string;
      method: string;
      note: string;
      date: string;
    }> = [];

    for (const row of rows) {
      const num = parseFloat(row.amount);
      if (!row.amount || isNaN(num) || num <= 0) {
        toast.error(t.amountRequired);
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

    addTransactions(validRows);
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border max-h-[92vh] overflow-y-auto bg-card"
      >
        <SheetHeader>
          <SheetTitle className="text-center">
            {t.addTransaction}
            {rows.length > 1 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({rows.length} {t.itemCount})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 space-y-5 pb-6 px-1">
          {/* Type Toggle - Shared across all rows */}
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

          {/* Transaction Rows */}
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="relative p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-4"
              >
                {/* Row number and delete button */}
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

                {/* Amount Field with Currency Formatting */}
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

                {/* Category and Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t.category}</Label>
                    <Select
                      value={row.category}
                      onValueChange={(v) => updateRow(row.id, "category", v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_KEYS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {t.categories[c]}
                          </SelectItem>
                        ))}
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
                        {METHOD_KEYS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {t.methods[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Field */}
                <div className="space-y-1.5">
                  <Label>{t.date}</Label>
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, "date", e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* Note Field */}
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

          {/* Add Another Button */}
          <Button
            variant="outline"
            onClick={addRow}
            className="w-full rounded-xl h-11 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.addAnother}
          </Button>

          {/* Action Buttons */}
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
  );
}
