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

const splitGraphemes = (value: string) => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }

  return Array.from(value);
};

const isEmojiGrapheme = (value: string) =>
  /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(value);

const getFirstGrapheme = (value: string) => splitGraphemes(value.trim())[0] ?? "";

const stripOuterEmojiGraphemes = (value: string) => {
  const graphemes = splitGraphemes(value.trim());

  while (graphemes.length > 0 && isEmojiGrapheme(graphemes[0])) {
    graphemes.shift();
  }

  while (graphemes.length > 0 && isEmojiGrapheme(graphemes[graphemes.length - 1])) {
    graphemes.pop();
  }

  return graphemes.join("").trim();
};

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
    const stripped = stripOuterEmojiGraphemes(name);
    const trimmedName = stripped || name.trim();
    if (!trimmedName) return;
    onSubmit(trimmedName, emoji);
    setName("");
    setEmoji("");
    onOpenChange(false);
  };


  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmoji(getFirstGrapheme(e.target.value));
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