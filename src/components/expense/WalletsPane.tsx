import { useStore } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Plus } from "lucide-react";

interface Props {
  onAddTransaction: (walletId?: string) => void;
  onManageWallets?: () => void;
}

/**
 * Sticky right-column pane (lg+) and bottom-sheet content (mobile).
 * Shows all wallet balances + quick action FABs.
 */
export function WalletsPane({ onAddTransaction, onManageWallets }: Props) {
  const { walletsWithBalance, t, netWorth } = useStore();

  return (
    <div className="space-y-3">
      {/* Net worth header */}
      <Card className="card-soft p-5">
        <div className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {t.balance}
        </div>
        <div className="mt-1">
          <SmartAmount value={netWorth} className="text-3xl font-semibold" />
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="rounded-xl h-12 flex-col gap-0.5 text-[11px]"
          onClick={() => onAddTransaction()}
        >
          <ArrowUpRight className="h-4 w-4" style={{ color: "var(--expense)" }} />
          {t.expense}
        </Button>
        <Button
          variant="outline"
          className="rounded-xl h-12 flex-col gap-0.5 text-[11px]"
          onClick={() => onAddTransaction()}
        >
          <ArrowDownLeft className="h-4 w-4" style={{ color: "var(--income)" }} />
          {t.income}
        </Button>
        <Button
          variant="outline"
          className="rounded-xl h-12 flex-col gap-0.5 text-[11px]"
          onClick={() => onAddTransaction()}
        >
          <ArrowRightLeft className="h-4 w-4 text-primary" />
          {t.transfer}
        </Button>
      </div>

      {/* Wallets summary */}
      <Card className="card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-foreground">
            {t.quickSummary}
          </div>
          {onManageWallets && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={onManageWallets}
            >
              <Plus className="h-3 w-3 mr-1" />
              {t.addWallet}
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {walletsWithBalance.map((w) => (
            <button
              key={w.id}
              onClick={() => onAddTransaction(w.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {w.name}
                </div>
              </div>
              <SmartAmount value={w.balance} className="text-sm font-semibold" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
