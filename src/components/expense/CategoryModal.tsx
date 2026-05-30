import { useState, useEffect } from "react";
import { useStore, TxType, CustomCategory } from "@/lib/expense-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TxType;
  editCategory?: CustomCategory | null;
  onSubmit: (name: string, emoji: string) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  type,
  editCategory,
  onSubmit,
}: CategoryModalProps) {
  const { t, lang } = useStore();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setName(editCategory.name);
        setEmoji(editCategory.emoji);
      } else {
        setName("");
        setEmoji("");
      }
    }
  }, [open, editCategory]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit(trimmedName, emoji);
    setName("");
    setEmoji("");
    onOpenChange(false);
  };

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow the first character (single emoji/character)
    if (value.length <= 1) {
      setEmoji(value);
    } else {
      // If user pastes multiple characters, take only the first one
      setEmoji(value.charAt(0));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold">
            {editCategory
              ? t.edit + " " + editCategory.name
              : t.addNewCategory}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Emoji Field - Single character only */}
          <div className="space-y-2">
            <Label className="text-xs">{t.walletEmoji}</Label>
            <Input
              type="text"
              value={emoji}
              onChange={handleEmojiChange}
              maxLength={1}
              placeholder={t.emojiPlaceholder}
              className="h-12 text-2xl text-center rounded-xl"
            />
            <p className="text-[10px] text-muted-foreground">
              {lang === "th" ? "ใส่สัญลักษณ์ 1 ตัวอักษร" : "Enter a single character emoji"}
            </p>
          </div>

          {/* Category Name Field */}
          <div className="space-y-2">
            <Label className="text-xs">{t.newCategoryPlaceholder}</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.newCategoryPlaceholder}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-xl"
          >
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}