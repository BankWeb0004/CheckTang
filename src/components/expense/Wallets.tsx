import { useState } from "react";
import { useStore } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { AdjustBalanceModal } from "@/components/expense/AdjustBalanceModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Scale } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onOpenWallet?: (walletId: string) => void;
}

export function Wallets({ onOpenWallet }: Props) {
  const { walletsWithBalance, addWallet, deleteWallet, t, lang } = useStore();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👛");
  const [adjustId, setAdjustId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const w = addWallet(n, emoji.trim() || "👛");
    if (w) {
      setName("");
      setEmoji("👛");
      toast.success(lang === "th" ? "เพิ่มกระเป๋าแล้ว" : "Wallet added");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-foreground">{t.wallets}</h1>
      </div>

      {/* Add wallet form */}
      <Card className="card-soft p-3">
        <form onSubmit={handleAdd} className="flex gap-2 items-end">
          <div className="w-16">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.walletEmoji}
            </label>
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
              className="h-10 text-center text-lg rounded-xl px-1"
              maxLength={4}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.walletName}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl text-sm"
              maxLength={40}
              required
            />
          </div>
          <Button type="submit" className="h-10 rounded-xl px-3">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {walletsWithBalance.map((w) => (
          <Card
            key={w.id}
            className="card-soft p-3 cursor-pointer hover:bg-muted/30 transition-colors group relative"
            onClick={() => onOpenWallet?.(w.id)}
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-muted-foreground truncate">{w.name}</div>
                <SmartAmount value={w.balance} className="text-base font-semibold" />
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAdjustId(w.id);
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  aria-label={t.adjustBalance}
                  title={t.adjustBalance}
                >
                  <Scale className="h-4 w-4" />
                </button>
                {walletsWithBalance.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(t.confirmDeleteWallet)) {
                        deleteWallet(w.id);
                        toast.success(lang === "th" ? "ลบแล้ว" : "Deleted");
                      }
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                    aria-label={t.deleteWallet}
                    title={t.deleteWallet}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AdjustBalanceModal
        walletId={adjustId}
        open={!!adjustId}
        onOpenChange={(o) => {
          if (!o) setAdjustId(null);
        }}
      />
    </div>
  );
}
