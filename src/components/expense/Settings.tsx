import { useRef } from "react";
import {
  useStore,
  THEME_PRESETS,
  Lang,
  CURRENCIES,
  CurrencyCode,
} from "@/lib/expense-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Upload, X, Sun, Moon, BookOpen, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { appConfig } from "@/lib/app-config";

/** Compress image client-side: max 1080px wide, JPEG 75%. */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1080;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
    wallpapers,
    addWallpaper,
    removeWallpaper,
    setActiveWallpaperIndex,
    setWallpaper,
    currency,
    setCurrency,
    openTutorial,
  } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(lang === "th" ? "ไฟล์ใหญ่เกินไป (สูงสุด 10MB)" : "Image too large (max 10MB)");
      return;
    }
    if (wallpapers.length >= 5) {
      toast.error(lang === "th" ? "เพิ่มได้สูงสุด 5 ภาพ" : "Maximum 5 wallpapers");
      e.target.value = "";
      return;
    }
    try {
      const compressed = await compressImage(file);
      addWallpaper(compressed);
      toast.success(lang === "th" ? "เพิ่มวอลเปเปอร์แล้ว" : "Wallpaper added");
    } catch {
      toast.error("Failed to load image");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      {/* ================= APP SETTINGS ================= */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          {t.appSettings}
        </h2>

        {/* Combined Theme / Mode / Language card */}
        <Card className="card-soft p-3 divide-y divide-border">
          {/* Accent */}
          <div className="pb-3">
            <div className="text-xs font-medium mb-2 text-foreground">
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
                      className="relative h-9 w-9 rounded-full transition-all duration-200 flex items-center justify-center"
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
                          className="h-3.5 w-3.5"
                          style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium text-center leading-tight max-w-[60px]"
                      style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
                    >
                      {lang === "th" ? p.nameTh : p.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode + Lang inline */}
          <div className="pt-3 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {lang === "th" ? "โหมด" : "Mode"}
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-0.5">
                <button
                  onClick={() => setDarkMode(false)}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: !darkMode ? "var(--card)" : "transparent",
                    color: !darkMode ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: darkMode ? "var(--card)" : "transparent",
                    color: darkMode ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {t.language}
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-0.5">
                {(["en", "th"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: lang === l ? "var(--card)" : "transparent",
                      color: lang === l ? "var(--foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {l === "en" ? "EN" : "ไทย"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Wallpaper gallery */}
        <Card className="card-soft p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-foreground">{t.wallpaperGallery}</div>
            <span className="text-[10px] text-muted-foreground">{wallpapers.length} / 5</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {/* "No wallpaper" tile */}
            <button
              onClick={() => setWallpaper(null)}
              className="relative h-20 w-20 rounded-2xl border border-dashed border-border bg-muted/30 flex items-center justify-center flex-shrink-0"
              aria-label="No wallpaper"
            >
              <X className="h-5 w-5 text-muted-foreground" />
              {!wallpaper && (
                <span
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--primary)" }}
                >
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
            </button>

            {wallpapers.map((wp, i) => {
              const active = wp === wallpaper;
              return (
                <div key={i} className="relative flex-shrink-0">
                  <button
                    onClick={() => setActiveWallpaperIndex(i)}
                    className="h-20 w-20 rounded-2xl bg-cover bg-center border border-border"
                    style={{ backgroundImage: `url(${wp})` }}
                    aria-label={`Wallpaper ${i + 1}`}
                  />
                  {active && (
                    <span
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--primary)" }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <button
                    onClick={() => removeWallpaper(i)}
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}

            {wallpapers.length < 5 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="h-20 w-20 rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-0.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[10px]">{t.addWallpaperSlot}</span>
              </button>
            )}
          </div>
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
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">
              {t.viewTutorial}
            </span>
          </button>
        </Card>
      </section>

      {/* ================= FINANCIAL MANAGEMENT ================= */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          {t.financialManagement}
        </h2>
        <Card className="card-soft p-3">
          <div className="text-xs font-medium mb-2 text-foreground">
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
      </section>

      {/* ================= ABOUT APP ================= */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          {t.aboutApp}
        </h2>
        <Card className="card-soft p-4 text-center">
          <div className="text-sm font-bold text-foreground">
            เช็คตังค์ (CHECK TANG)
            <span className="text-muted-foreground font-medium"> — V{appConfig.currentVersion} (Universal)</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Developer: Watcharaphong Chiamthaisong (Bank)
          </div>
        </Card>
      </section>
    </div>
  );
}
