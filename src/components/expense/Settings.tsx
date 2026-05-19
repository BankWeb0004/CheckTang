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
import { Check, Upload, X, Sun, Moon, BookOpen } from "lucide-react";
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
    openTutorial,
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
    <div className="space-y-3">
      {/* Accent Color */}
      <Card className="card-soft p-3">
        <div className="text-sm font-medium mb-2 text-foreground">
          {lang === "th" ? "สีหลัก" : "Accent Color"}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map((p) => {
            const active = theme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTheme(p.id)}
                className="flex flex-col items-center gap-1"
                aria-label={lang === "th" ? p.nameTh : p.nameEn}
              >
                <div
                  className="relative h-10 w-10 rounded-full transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: p.accentColor,
                    outline: active ? `2px solid var(--foreground)` : "2px solid transparent",
                    outlineOffset: "2px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                    transform: active ? "scale(1.06)" : "scale(1)",
                  }}
                >
                  {active && (
                    <Check
                      className="h-4 w-4"
                      style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
                    />
                  )}
                </div>
                <span
                  className="text-[11px] font-medium text-center leading-tight max-w-[56px]"
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
      <Card className="card-soft p-3">
        <div className="text-sm font-medium mb-2 text-foreground">
          {lang === "th" ? "โหมดสี" : "Display Mode"}
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
          <button
            onClick={() => setDarkMode(false)}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200"
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
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200"
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

      {/* Language */}
      <Card className="card-soft p-3">
        <div className="text-sm font-medium mb-2 text-foreground">{t.language}</div>
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
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
      <Card className="card-soft p-3">
        <div className="text-sm font-medium mb-2 text-foreground">
          {lang === "th" ? "สกุลเงิน" : "Currency"}
        </div>
        <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
          <SelectTrigger className="h-10 rounded-xl text-sm">
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

      {/* Wallpaper */}
      <Card className="card-soft p-3">
        <div className="text-sm font-medium mb-2 text-foreground">{t.wallpaper}</div>
        {wallpaper ? (
          <div className="grid gap-2">
            <div
              className="h-20 rounded-2xl bg-cover bg-center border border-border"
              style={{ backgroundImage: `url(${wallpaper})` }}
            />
            <Button
              variant="outline"
              className="w-full rounded-xl h-10"
              onClick={() => setWallpaper(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-xl h-10"
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

      {/* Tutorial */}
      <Card className="card-soft p-2">
        <button
          onClick={openTutorial}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-foreground flex-1">
            {t.viewTutorial}
          </span>
        </button>
      </Card>

      {/* About */}
      <Card className="card-soft p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {lang === "th" ? "เกี่ยวกับแอป" : "About App"}
            </div>
            <div className="text-base font-bold text-foreground">เช็คตังค์</div>
          </div>
          <div className="text-[11px] text-right font-semibold uppercase tracking-[0.2em] text-muted-foreground space-y-0.5">
            <div>Dev by bank</div>
            <div>v1.0.0</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
