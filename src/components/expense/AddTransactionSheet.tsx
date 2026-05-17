import { useState } from "react";
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

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AddTransactionSheet({ open, onOpenChange }: Props) {
  const { t, addTransaction } = useStore();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [method, setMethod] = useState<string>("Cash");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const reset = () => {
    setType("expense");
    setAmount("");
    setCategory("Food");
    setMethod("Cash");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      toast.error(t.amountRequired);
      return;
    }
    addTransaction({ type, amount: num, category, method, note, date });
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
          <SheetTitle className="text-center">{t.addTransaction}</SheetTitle>
        </SheetHeader>

        <div className="mt-2 space-y-5 pb-6 px-1">
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

          <div className="space-y-1.5">
            <Label>{t.amount}</Label>
            <Input
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-2xl h-14 rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t.category}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
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
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
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

          <div className="space-y-1.5">
            <Label>{t.date}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              {t.note} <span className="text-xs text-muted-foreground">({t.optional})</span>
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

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
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
