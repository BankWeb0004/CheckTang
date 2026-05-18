import { useRef } from "react";
import { useStore, THEME_PRESETS, Lang, CURRENCIES, CurrencyCode } from "@/lib/expense-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Upload, X } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const { theme, setTheme, lang, setLang, t, wallpaper, setWallpaper, currency, setCurrency } =
    useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image too large (max 4MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setWallpaper(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3">{t.language}</div>
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted">
          {(["en", "th"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: lang === l ? "var(--card)" : "transparent",
                color: lang === l ? "var(--foreground)" : "var(--muted-foreground)",
                boxShadow: lang === l ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {l === "en" ? "English" : "ไทย"}
            </button>
          ))}
        </div>
      </Card>

      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3">
          {lang === "th" ? "สกุลเงิน" : "Currency"}
        </div>
        <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3">{t.theme}</div>
        <div className="grid grid-cols-2 gap-2.5">
          {THEME_PRESETS.map((p) => {
            const active = theme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTheme(p.id)}
                className="relative p-3 rounded-2xl text-left border transition-all"
                style={{
                  borderColor: active ? "var(--ring)" : "var(--border)",
                  background: "var(--card)",
                }}
              >
                <div className="flex gap-1 mb-2">
                  {p.swatch.map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-md border border-border/50"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">
                    {lang === "th" ? p.nameTh : p.nameEn}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3">{t.wallpaper}</div>
        {wallpaper ? (
          <div className="space-y-3">
            <div
              className="h-32 rounded-2xl bg-cover bg-center border border-border"
              style={{ backgroundImage: `url(${wallpaper})` }}
            />
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setWallpaper(null)}
            >
              <X className="h-4 w-4 mr-2" /> {t.removeWallpaper}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-xl h-12"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" /> {t.uploadWallpaper}
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
      </Card>

      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-4">
          {lang === "th" ? "เกี่ยวกับแอปพลิเคชัน" : "About Application"}
        </div>
        <div className="flex flex-col items-center gap-2 py-2">
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            เช็คตังค์
          </span>
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            DEV BY BANK
          </span>
          <span className="text-xs text-muted-foreground mt-1">v1.2.1</span>
        </div>
      </Card>
    </div>
  );
}
