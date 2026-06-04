import { useRef, useState } from "react";
import {
  useStore,
  THEME_PRESETS,
  Lang,
  CURRENCIES,
  CurrencyCode,
} from "@/lib/expense-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Upload, X, Sun, Moon, BookOpen, Trash2, Plus, Download } from "lucide-react";
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
    wallets,
    transactions,
    addTransactions,
    setWallets,
    setTransactions,
  } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);

  // Easter egg: Tap footer 7 times within 3 seconds to show PIN modal
  const handleFooterTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    if (timeSinceLastTap > 3000) {
      // Reset if more than 3 seconds have passed
      setTapCount(1);
    } else {
      setTapCount((prev: number) => prev + 1);
    }

    setLastTapTime(now);

    if (tapCount + 1 === 7) {
      setShowPinModal(true);
      setTapCount(0);
    }
  };

  const handlePinSubmit = () => {
    const masterPin = import.meta.env.VITE_DEV_MASTER_PIN?.toString().trim() || "";
    if (pinInput === masterPin) {
      setShowPinModal(false);
      setPinInput("");
      // Navigate to admin page (will implement next)
      window.location.href = "/admin";
    } else {
      toast.error(lang === "th" ? "PIN ไม่ถูกต้อง" : "Invalid PIN");
      setPinInput("");
    }
  };

  const handleFeedbackSubmit = async () => {
    const now = Date.now();
    const cooldownMs = 2 * 60 * 1000; // 2 minutes

    if (now - lastFeedbackTime < cooldownMs) {
      const remainingTime = Math.ceil((cooldownMs - (now - lastFeedbackTime)) / 1000);
      toast.error(
        lang === "th"
          ? `กรุณารอ ${remainingTime} วินาทีก่อนส่งซ้ำ`
          : `Please wait ${remainingTime} seconds before sending again`
      );
      return;
    }

    if (!feedbackText.trim()) {
      toast.error(lang === "th" ? "กรุณากรอกข้อความ" : "Please enter your message");
      return;
    }

    setIsSending(true);

    try {
      const feedbackApiBase = import.meta.env.VITE_FEEDBACK_API_BASE;
      if (!feedbackApiBase) {
        throw new Error("Feedback API base URL not configured");
      }

      const response = await fetch(feedbackApiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: feedbackText,
          timestamp: new Date().toISOString(),
          appVersion: appConfig.currentVersion,
          language: lang,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success(lang === "th" ? "ส่งความคิดเห็นสำเร็จ" : "Feedback submitted successfully");
      setFeedbackText("");
      setShowFeedbackModal(false);
      setLastFeedbackTime(Date.now());
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(lang === "th" ? "ส่งความคิดเห็นล้มเหลว" : "Failed to submit feedback");
    } finally {
      setIsSending(false);
    }
  };

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

  // Export data handler
  const handleExportData = async () => {
    try {
      const exportData = {
        version: appConfig.currentVersion,
        exportedAt: new Date().toISOString(),
        wallets,
        transactions,
      };

      const json = JSON.stringify(exportData, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const filename = `checktang_backup_${timestamp}.json`;

      // Detect native (Capacitor) runtime
      const isNative =
        typeof window !== "undefined" &&
        ((window as any).Capacitor?.isNativePlatform?.() ?? false);

      if (isNative) {
        // Save to app Documents directory and open share dialog so user can pick destination
        const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        const writeResult = await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });

        try {
          await Share.share({
            title: filename,
            text: lang === "th" ? "ไฟล์สำรองข้อมูล Check Tang" : "Check Tang backup file",
            url: writeResult.uri,
            dialogTitle: lang === "th" ? "บันทึกไฟล์สำรองข้อมูล" : "Save backup file",
          });
        } catch {
          // user cancelled share — file is still saved
        }

        toast.success(
          lang === "th"
            ? `บันทึกไว้ที่ Documents/${filename}`
            : `Saved to Documents/${filename}`,
          { duration: 5000 }
        );
      } else {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(lang === "th" ? "สำรองข้อมูลสำเร็จ" : "Data exported successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(lang === "th" ? "สำรองข้อมูลล้มเหลว" : "Export failed");
    }
  };


  // Import data handler
  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate schema
      if (!data.wallets || !Array.isArray(data.wallets)) {
        throw new Error("Invalid wallets data");
      }
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error("Invalid transactions data");
      }

      // Validate wallet structure
      for (const wallet of data.wallets) {
        if (!wallet.id || !wallet.name || !wallet.emoji) {
          throw new Error("Invalid wallet structure");
        }
      }

      // Validate transaction structure
      for (const tx of data.transactions) {
        if (!tx.id || !tx.wallet_id || !tx.type || typeof tx.amount !== "number") {
          throw new Error("Invalid transaction structure");
        }
      }

      // Confirm import
      const confirmed = window.confirm(
        lang === "th"
          ? "นำเข้าข้อมูลจะแทนที่ข้อมูลทั้งหมดของคุณ ต้องการดำเนินการต่อหรือไม่?"
          : "Importing data will replace all your existing data. Continue?"
      );

      if (!confirmed) {
        e.target.value = "";
        return;
      }

      // Import data
      setWallets(data.wallets);
      setTransactions(data.transactions);

      toast.success(lang === "th" ? "นำเข้าข้อมูลสำเร็จ" : "Data imported successfully");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        lang === "th"
          ? "นำเข้าข้อมูลล้มเหลว: รูปแบบไฟล์ไม่ถูกต้อง"
          : "Import failed: Invalid file format"
      );
    } finally {
      e.target.value = "";
    }
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

        {/* Backup & Restore */}
        <Card className="card-soft p-3">
          <div className="text-xs font-medium mb-3 text-foreground">
            {lang === "th" ? "สำรองและนำเข้าข้อมูล" : "Backup & Restore"}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl text-sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              {lang === "th" ? "สำรองข้อมูล" : "Export"}
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl text-sm"
              onClick={() => importRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {lang === "th" ? "นำเข้าข้อมูล" : "Import"}
            </Button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportData}
          />
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
          <div
            className="text-[11px] text-muted-foreground mt-1 cursor-pointer select-none"
            onClick={handleFooterTap}
          >
            Developer: Watcharaphong Chiamthaisong (Bank)
          </div>
        </Card>

        {/* Feedback Button */}
        <Card className="card-soft p-2">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">
              💬 {lang === "th" ? "ส่งความคิดเห็น / รายงานปัญหา" : "Send Feedback / Report Issue"}
            </span>
          </button>
        </Card>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl p-6 w-full max-w-sm mx-4 border border-border shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {lang === "th" ? "กรอกรหัส PIN" : "Enter PIN"}
              </h3>
              <Input
                type="password"
                value={pinInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="h-12 text-center text-2xl tracking-widest rounded-xl mb-4"
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handlePinSubmit();
                  if (e.key === "Escape") {
                    setShowPinModal(false);
                    setPinInput("");
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput("");
                  }}
                >
                  {t.cancel}
                </Button>
                <Button
                  className="flex-1 h-10 rounded-xl"
                  onClick={handlePinSubmit}
                >
                  {t.save}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                💬 {lang === "th" ? "ส่งความคิดเห็น / รายงานปัญหา" : "Send Feedback / Report Issue"}
              </h3>
              <textarea
                value={feedbackText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackText(e.target.value)}
                placeholder={lang === "th" ? "กรอกข้อความของคุณที่นี่..." : "Enter your message here..."}
                className="w-full h-32 p-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  disabled={isSending}
                >
                  {t.cancel}
                </Button>
                <Button
                  className="flex-1 h-10 rounded-xl"
                  onClick={handleFeedbackSubmit}
                  disabled={isSending || !feedbackText.trim()}
                >
                  {isSending
                    ? (lang === "th" ? "กำลังส่ง..." : "Sending...")
                    : (lang === "th" ? "ส่ง" : "Send")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
