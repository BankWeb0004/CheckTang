import { useState } from "react";
import { useStore } from "@/lib/expense-store";
import { SmartAmount } from "@/components/expense/SmartAmount";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function Wallets() {
  const { walletsWithBalance, t, addWallet, updateWallet, deleteWallet } =
    useStore();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👛");

  const openNew = () => {
    setEditId(null);
    setName("");
    setEmoji("👛");
    setOpen(true);
  };
  const openEdit = (id: string, n: string, e: string) => {
    setEditId(id);
    setName(n);
    setEmoji(e);
    setOpen(true);
  };
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t.walletName);
      return;
    }
    if (editId) {
      updateWallet(editId, { name: trimmed, emoji: emoji || "👛" });
    } else {
      const w = addWallet(trimmed, emoji || "👛");
      if (!w) {
        toast.error(t.walletName);
        return;
      }
    }
    setOpen(false);
  };
  const onDelete = (id: string) => {
    if (!confirm(t.confirmDeleteWallet)) return;
    const ok = deleteWallet(id);
    if (!ok) toast.error(t.cannotDeleteLastWallet);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t.wallets}
        </h2>
        <Button size="sm" onClick={openNew} className="rounded-xl h-9">
          <Plus className="h-4 w-4 mr-1.5" />
          {t.addWallet}
        </Button>
      </div>

      <div className="space-y-2">
        {walletsWithBalance.map((w) => (
          <Card key={w.id} className="card-soft p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
              {w.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">
                {w.name}
              </div>
              <div className="text-xs text-muted-foreground">{t.balance}</div>
            </div>
            <div className="text-right">
              <SmartAmount value={w.balance} className="text-base font-semibold" />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-50 hover:opacity-100"
                onClick={() => openEdit(w.id, w.name, w.emoji)}
                aria-label="edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-50 hover:opacity-100"
                onClick={() => onDelete(w.id)}
                aria-label={t.deleteWallet}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editId ? t.editTransaction : t.addWallet}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-[5rem_1fr] gap-2 items-end pt-2">
            <div className="space-y-1.5">
              <Label>{t.walletEmoji}</Label>
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value.slice(0, 8))}
                placeholder="👛"
                className="rounded-xl h-11 text-center text-xl"
                maxLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.walletName}</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.walletName}
                maxLength={40}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              {t.cancel}
            </Button>
            <Button onClick={submit} className="rounded-xl">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
