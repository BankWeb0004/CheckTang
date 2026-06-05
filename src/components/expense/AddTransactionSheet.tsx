import { useEffect, useMemo, useState } from "react";
import {
  useStore,
  Transaction,
  TxType,
  getCategoryLabel,
  DEFAULT_CATEGORY_EMOJI,
  CustomCategory,
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
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Plus, Pencil, Trash2 } from "lucide-react";
import { CategoryModal } from "@/components/expense/CategoryModal";

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
    editCustomCategory,
    deleteCustomCategory,
    customCategories,
    getCustomCategoryEmoji,
    defaultWalletId,
  } = useStore();

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [walletId, setWalletId] = useState<string>("");
  const [toWalletId, setToWalletId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [addMore, setAddMore] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);

  const isEdit = !!editTransaction;

  // Hydrate when opening
  useEffect(() => {
    if (!open) return;
    if (editTransaction) {
      setType(editTransaction.type);
      const amtStr = String(editTransaction.amount);
      setAmount(amtStr);
      setAmountDisplay(formatNumberWithCommas(amtStr));
      setWalletId(editTransaction.wallet_id);
      setToWalletId(editTransaction.to_wallet_id ?? "");
      setCategory(editTransaction.category_name);
      setNote(editTransaction.note);
      setDate(editTransaction.date);
    } else {
      setType(initialType ?? "expense");
      setAmount("");
      setAmountDisplay("");
      setWalletId(initialWalletId || defaultWalletId || wallets[0]?.id || "");
      setToWalletId("");
      setCategory("");
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      setAddMore(false);
    }
  }, [open, editTransaction, initialWalletId, initialType, defaultWalletId, wallets]);

  // Format number with thousands separator
  const formatNumberWithCommas = (value: string): string => {
    if (!value) return "";
    // Remove existing commas and non-numeric chars except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");
    if (!cleanValue) return "";
    
    const parts = cleanValue.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    
    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Combine with decimal part if exists
    if (decimalPart) {
      return `${formattedInteger}.${decimalPart.slice(0, 2)}`;
    }
    return formattedInteger;
  };

  // Handle amount input change with live formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value.replace(/,/g, ""))) {
      const cleanValue = value.replace(/,/g, "");
      setAmount(cleanValue);
      setAmountDisplay(formatNumberWithCommas(cleanValue));
    }
  };

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

    // Resolve emoji for custom categories
    const resolvedEmoji = type === "transfer"
      ? "🔁"
      : (getCustomCategoryEmoji(type, category) ?? DEFAULT_CATEGORY_EMOJI[category] ?? (category.match(/\p{Emoji}/u)?.[0] ?? ""));

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
      category_emoji: resolvedEmoji,
      note,
      date,
    };

    if (isEdit && editTransaction) {
      updateTransaction(editTransaction.id, payload);
      toast.success(lang === "th" ? "บันทึกการแก้ไขแล้ว" : "Updated");
      onOpenChange(false);
    } else {
      addTransaction(payload);
      toast.success(lang === "th" ? "บันทึกแล้ว" : "Saved");
      
      if (addMore) {
        // Clear fields for next entry but keep sheet open
        setAmount("");
        setAmountDisplay("");
        setCategory("");
        setNote("");
        setDate(new Date().toISOString().slice(0, 10));
      } else {
        onOpenChange(false);
      }
    }
  };

  // Get custom categories for the current type
  const currentCustomCategories = useMemo(() => {
    if (type === "transfer") return [];
    return type === "expense" ? customCategories.expense : customCategories.income;
  }, [type, customCategories]);

  const isCustomCategory = (cat: string): boolean => {
    return currentCustomCategories.some((c) => c.name === cat);
  };

  const getCustomCategoryData = (cat: string): CustomCategory | undefined => {
    return currentCustomCategories.find((c) => c.name === cat);
  };

  const handleOpenCategoryModal = (editCat?: CustomCategory) => {
    if (type === "transfer") return;
    setEditingCategory(editCat || null);
    setCategoryModalOpen(true);
  };

  const handleCategoryModalSubmit = (name: string, emoji: string) => {
    if (editingCategory) {
      // Edit existing category
      const ok = editCustomCategory(type, editingCategory.name, name, emoji);
      if (ok) {
        if (category === editingCategory.name) {
          setCategory(name);
        }
        toast.success(lang === "th" ? "แก้ไขหมวดหมู่แล้ว" : "Category updated");
      } else {
        toast.error(lang === "th" ? "ไม่สำเร็จ" : "Could not update");
      }
    } else {
      // Add new category
      const ok = addCustomCategory(type, name, emoji);
      if (ok) {
        setCategory(name);
        toast.success(lang === "th" ? "เพิ่มหมวดหมู่แล้ว" : "Category added");
      } else {
        toast.error(lang === "th" ? "ไม่สำเร็จ" : "Could not add");
      }
    }
  };

  const handleDeleteCustomCategory = (cat: string) => {
    if (!confirm(lang === "th" ? "ลบหมวดหมู่นี้?" : "Delete this category?")) return;
    const ok = deleteCustomCategory(type, cat);
    if (ok) {
      if (category === cat) setCategory("");
      toast.success(lang === "th" ? "ลบแล้ว" : "Deleted");
    } else {
      toast.error(lang === "th" ? "ไม่สำเร็จ" : "Could not delete");
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
              value={amountDisplay}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="h-14 text-2xl font-semibold rounded-2xl text-center"
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
                  const isCustom = isCustomCategory(cat);
                  const customData = isCustom ? getCustomCategoryData(cat) : null;
                  const emoji = (customData?.emoji || DEFAULT_CATEGORY_EMOJI[cat]) ?? cat.match(/\p{Emoji}/u)?.[0] ?? "🏷️";
                  
                  return (
                    <div key={cat} className="relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border flex items-center gap-1"
                        style={{
                          background: active ? "var(--primary)" : "var(--card)",
                          color: active ? "var(--primary-foreground)" : "var(--foreground)",
                          borderColor: active ? "var(--primary)" : "var(--border)",
                          paddingRight: isCustom ? "2.75rem" : undefined,
                        }}
                      >
                        <span>{emoji}</span>
                        <span>{label}</span>
                      </button>
                      {/* Edit/Delete buttons for custom categories — always visible (mobile-friendly) */}
                      {isCustom && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCategoryModal(customData || undefined);
                            }}
                            className="p-1 rounded-full hover:bg-black/10 active:bg-black/20"
                            style={{ color: active ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
                            aria-label="Edit category"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomCategory(cat);
                            }}
                            className="p-1 rounded-full hover:bg-black/10 active:bg-black/20"
                            style={{ color: active ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
                            aria-label="Delete category"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleOpenCategoryModal()}
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

          {!isEdit && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="addMore"
                checked={addMore}
                onChange={(e) => setAddMore(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="addMore"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                {lang === "th" ? "บันทึกและเพิ่มรายการอีก" : "Save and add another"}
              </label>
            </div>
          )}
        </div>

        {/* Category Modal for adding/editing custom categories */}
        <CategoryModal
          open={categoryModalOpen}
          onOpenChange={setCategoryModalOpen}
          type={type}
          editCategory={editingCategory}
          onSubmit={handleCategoryModalSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}

export default AddTransactionSheet;
