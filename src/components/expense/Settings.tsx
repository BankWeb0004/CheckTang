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
import { Check, Upload, X, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const {
    theme,
    setTheme,
    darkMode,
    setDarkMode,
    lang,
    setLang,
    t,
    wallpaper,
    setWallpaper,
    currency,
    setCurrency,
  } = useStore();
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
      {/* Language */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3 text-foreground">{t.language}</div>
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

      {/* Currency */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3 text-foreground">
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

      {/* Accent Color */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-5 text-foreground">
          {lang === "th" ? "สีหลัก" : "Accent Color"}
        </div>
        <div className="flex gap-4 justify-center items-start">
          {THEME_PRESETS.map((p) => {
            const active = theme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTheme(p.id)}
                className="flex flex-col items-center gap-3 p-2 rounded-xl transition-all duration-200 min-w-[72px]"
                style={{
                  background: active ? "var(--muted)" : "transparent",
                }}
                aria-label={lang === "th" ? p.nameTh : p.nameEn}
              >
                <div
                  className="relative h-14 w-14 rounded-full transition-all duration-200 flex items-center justify-center shrink-0"
                  style={{
                    background: p.accentColor,
                    outline: active ? `3px solid var(--foreground)` : "3px solid transparent",
                    outlineOffset: "3px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transform: active ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {active && (
                    <Check
                      className="h-6 w-6"
                      style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
                    />
                  )}
                </div>
                <span
                  className="text-xs font-medium text-center leading-tight whitespace-nowrap"
                  style={{
                    color: active ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {lang === "th" ? p.nameTh : p.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Display Mode */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3 text-foreground">
          {lang === "th" ? "โหมดสี" : "Display Mode"}
        </div>
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted gap-1">
          <button
            onClick={() => setDarkMode(false)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: !darkMode ? "var(--card)" : "transparent",
              color: !darkMode ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: !darkMode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Sun className="h-4 w-4" />
            {lang === "th" ? "สว่าง" : "Light"}
          </button>
          <button
            onClick={() => setDarkMode(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: darkMode ? "var(--card)" : "transparent",
              color: darkMode ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: darkMode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Moon className="h-4 w-4" />
            {lang === "th" ? "มืด" : "Dark"}
          </button>
        </div>
      </Card>

      {/* Wallpaper */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-3 text-foreground">{t.wallpaper}</div>
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

      {/* About */}
      <Card className="card-soft p-5">
        <div className="text-sm font-medium mb-4 text-foreground">
          {lang === "th" ? "เกี่ยวกับแอปพลิเคชัน" : "About Application"}
        </div>
        <div className="flex flex-col items-center gap-2 py-2">
          <span className="text-xl font-bold text-foreground">เช็คตังค์</span>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            DEV BY BANK
          </span>
          <span className="text-xs text-muted-foreground mt-1">v1.2.1</span>
        </div>
      </Card>
    </div>
  );
}
