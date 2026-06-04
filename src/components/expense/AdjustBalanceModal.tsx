import { useEffect, useState } from "react";
import { useStore, formatCurrency } from "@/lib/expense-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { toast } from "sonner";

interface Props {
  walletId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AdjustBalanceModal({ walletId, open, onOpenChange }: Props) {
  const { walletsWithBalance, adjustWalletBalance, t, lang, currency } = useStore();
  const wallet = walletsWithBalance.find((w) => w.id === walletId);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && wallet) {
      setValue(wallet.balance.toFixed(2));
      setNote("");
    }
  }, [open, wallet]);

  if (!wallet) return null;

  const parsed = parseFloat(value.replace(/,/g, ""));
  const diff = Number.isFinite(parsed) ? parsed - wallet.balance : 0;

  const handleSave = () => {
    if (!Number.isFinite(parsed)) {
      toast.error(t.amountRequired);
      return;
    }
    const ok = adjustWalletBalance(wallet.id, parsed, note);
    if (!ok) {
      toast.info(t.noChange);
      return;
    }
    toast.success(t.adjustBalanceSuccess);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{wallet.emoji}</span>
            <span>{t.adjustBalance}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t.adjustBalanceHint}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{wallet.name}</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(wallet.balance, lang, currency)}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.newActualBalance}
            </Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12 rounded-xl text-lg font-semibold text-right tabular-nums mt-1"
              autoFocus
            />
          </div>

          {Number.isFinite(parsed) && Math.abs(diff) > 0.005 && (
            <div
              className="text-[11px] rounded-lg px-3 py-2"
              style={{
                background: diff > 0 ? "color-mix(in oklab, var(--income) 12%, transparent)" : "color-mix(in oklab, var(--expense) 12%, transparent)",
                color: diff > 0 ? "var(--income)" : "var(--expense)",
              }}
            >
              {diff > 0 ? "+" : ""}
              {formatCurrency(diff, lang, currency)}
            </div>
          )}

          <div>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.note} ({t.optional})
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              className="h-10 rounded-xl text-sm mt-1"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button type="button" className="flex-1 rounded-xl" onClick={handleSave}>
              {t.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
