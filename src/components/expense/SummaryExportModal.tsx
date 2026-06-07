import { useMemo, useState } from "react";
import {
  useStore,
  formatCurrency,
  getCategoryLabel,
  DEFAULT_CATEGORY_EMOJI,
  ADJUSTMENT_CATEGORY,
  Transaction,
} from "@/lib/expense-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { appConfig } from "@/lib/app-config";
import { Download, Loader2 } from "lucide-react";

// ดึงตัวแปรโกลบอลหน้าต่างของ Capacitor มาเตรียมไว้ใช้งานอย่างปลอดภัย
const Capacitor = typeof window !== "undefined" ? (window as any).Capacitor : undefined;

type PeriodKind = "this-month" | "pick-month" | "range" | "year" | "all";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthStart(year: number, month: number) {
  return `${year}-${pad(month + 1)}-01`;
}
function monthEnd(year: number, month: number) {
  const d = new Date(year, month + 1, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function SummaryExportModal({ open, onOpenChange }: Props) {
  const {
    lang,
    currency,
    transactions,
    t,
    walletsWithBalance,
  } = useStore();

  const now = new Date();
  const [periodKind, setPeriodKind] = useState<PeriodKind>("this-month");
  const [pickYear, setPickYear] = useState(now.getFullYear());
  const [pickMonth, setPickMonth] = useState(now.getMonth());
  const [rangeFrom, setRangeFrom] = useState(
    monthStart(now.getFullYear(), now.getMonth())
  );
  const [rangeTo, setRangeTo] = useState(todayStr());
  const [yearOnly, setYearOnly] = useState(now.getFullYear());

  const [categoryScope, setCategoryScope] = useState<"top5" | "all">("top5");
  const [splitType, setSplitType] = useState<"expense" | "income" | "both">(
    "both"
  );
  const [showWallets, setShowWallets] = useState(true);

  const [isExporting, setIsExporting] = useState(false);

  const { from, to, label } = useMemo(() => {
    const months = lang === "th"
      ? ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearOffset = lang === "th" ? 543 : 0;
    if (periodKind === "this-month") {
      const y = now.getFullYear(), m = now.getMonth();
      return {
        from: monthStart(y, m),
        to: monthEnd(y, m),
        label: `${months[m]} ${y + yearOffset}`,
      };
    }
    if (periodKind === "pick-month") {
      return {
        from: monthStart(pickYear, pickMonth),
        to: monthEnd(pickYear, pickMonth),
        label: `${months[pickMonth]} ${pickYear + yearOffset}`,
      };
    }
    if (periodKind === "year") {
      return {
        from: `${yearOnly}-01-01`,
        to: `${yearOnly}-12-31`,
        label: `${lang === "th" ? "ปี" : "Year"} ${yearOnly + yearOffset}`,
      };
    }
    if (periodKind === "range") {
      return {
        from: rangeFrom,
        to: rangeTo,
        label: `${rangeFrom} → ${rangeTo}`,
      };
    }
    return {
      from: "0000-01-01",
      to: "9999-12-31",
      label: lang === "th" ? "ทั้งหมด" : "All time",
    };
  }, [periodKind, pickYear, pickMonth, rangeFrom, rangeTo, yearOnly, lang]);

  // Filter transactions in period
  const inPeriod: Transaction[] = useMemo(
    () => transactions.filter((tx) => tx.date >= from && tx.date <= to),
    [transactions, from, to]
  );

  const totalIncome = inPeriod
    .filter((tx) => tx.type === "income")
    .reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = inPeriod
    .filter((tx) => tx.type === "expense")
    .reduce((s, tx) => s + tx.amount, 0);

  function buildCategoryRows(type: "income" | "expense") {
    const map: Record<string, { value: number; emoji: string }> = {};
    inPeriod
      .filter((tx) => tx.type === type && tx.category_name !== ADJUSTMENT_CATEGORY)
      .forEach((tx) => {
        const k = tx.category_name;
        if (!map[k])
          map[k] = { value: 0, emoji: tx.category_emoji || DEFAULT_CATEGORY_EMOJI[k] || "" };
        map[k].value += tx.amount;
      });
    const rows = Object.entries(map)
      .map(([name, v]) => ({
        name,
        label: getCategoryLabel(name, t.categories),
        emoji: v.emoji,
        value: v.value,
      }))
      .sort((a, b) => b.value - a.value);
    return rows;
  }

  const renderImage = (): string => {
    const W = 1080;
    const H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Resolve primary color
    const probe = document.createElement("div");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "oklch(0.65 0.18 250)";
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    document.body.removeChild(probe);

    // Background — soft cream paper with vertical accent fade
    ctx.fillStyle = "#f7f6f3";
    ctx.fillRect(0, 0, W, H);

    // Top hero band
    const heroH = 560;
    const heroGrad = ctx.createLinearGradient(0, 0, 0, heroH);
    heroGrad.addColorStop(0, accent);
    heroGrad.addColorStop(1, accent);
    ctx.fillStyle = heroGrad;
    ctx.fillRect(0, 0, W, heroH);
    // soft glow
    const glow = ctx.createRadialGradient(W * 0.85, 100, 40, W * 0.85, 100, 600);
    glow.addColorStop(0, "rgba(255,255,255,0.35)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, heroH);

    // Logo / header
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "600 38px ui-sans-serif, system-ui, 'Apple Color Emoji'";
    ctx.textAlign = "left";
    ctx.fillText("💰 เช็คตังค์ · CHECK TANG", 70, 110);

    // Period label
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "500 28px ui-sans-serif, system-ui";
    ctx.fillText(lang === "th" ? "สรุปยอด · " + label : "Summary · " + label, 70, 160);

    // Hero number — total expense (or total income if expense-only excluded)
    const heroValue =
      splitType === "income" ? totalIncome :
      splitType === "expense" ? totalExpense :
      totalExpense;
    const heroLabel =
      splitType === "income" ? (lang === "th" ? "รายรับรวม" : "Total Income") :
      (lang === "th" ? "รายจ่ายรวม" : "Total Expense");

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "500 30px ui-sans-serif, system-ui";
    ctx.fillText(heroLabel, 70, 290);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 110px ui-sans-serif, system-ui";
    ctx.fillText(formatCurrency(heroValue, lang, currency), 70, 410);

    // Income/Expense pair (if both)
    if (splitType === "both") {
      const pillY = 450;
      const pillW = 420;
      const pillH = 70;
      // income pill
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      roundRect(ctx, 70, pillY, pillW, pillH, 22);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "600 24px ui-sans-serif, system-ui";
      ctx.fillText(`↓ ${lang === "th" ? "รายรับ" : "Income"}`, 90, pillY + 30);
      ctx.font = "700 28px ui-sans-serif, system-ui";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(formatCurrency(totalIncome, lang, currency), 90, pillY + 60);
    }

    // Donut chart + category list
    const rows = buildCategoryRows(splitType === "income" ? "income" : "expense");
    const totalCat = rows.reduce((s, r) => s + r.value, 0);
    const limited = categoryScope === "top5" ? rows.slice(0, 5) : rows.slice(0, 12);
    const otherSum = rows.slice(limited.length).reduce((s, r) => s + r.value, 0);
    const chartData = otherSum > 0
      ? [...limited, { name: "__other", label: lang === "th" ? "อื่นๆ" : "Other", emoji: "•", value: otherSum }]
      : limited;

    // White paper card
    const cardX = 50;
    const cardY = heroH + 30;
    const cardW = W - 100;
    const cardH = H - cardY - 110 - (showWallets ? 280 : 0);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, cardX, cardY, cardW, cardH, 42);
    ctx.fill();

    // Donut
    const cx = W / 2;
    const cy = cardY + 230;
    const rOuter = 170;
    const rInner = 105;
    if (totalCat > 0) {
      let start = -Math.PI / 2;
      chartData.forEach((row, i) => {
        const slice = (row.value / totalCat) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, rOuter, start, start + slice);
        ctx.closePath();
        ctx.fillStyle = PALETTE[i % PALETTE.length];
        ctx.fill();
        start += slice;
      });
      // donut hole
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.fill();
      // center label
      ctx.fillStyle = "#6b7280";
      ctx.font = "500 22px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(
        splitType === "income"
          ? (lang === "th" ? "รายรับ" : "Income")
          : (lang === "th" ? "รายจ่าย" : "Expense"),
        cx, cy - 8
      );
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 34px ui-sans-serif, system-ui";
      ctx.fillText(formatCurrency(totalCat, lang, currency), cx, cy + 30);
    } else {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 28px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(lang === "th" ? "ไม่มีข้อมูลในช่วงนี้" : "No data in range", cx, cy);
    }

    // List rows
    const listY = cardY + 440;
    const rowH = 78;
    const padX = cardX + 50;
    const listW = cardW - 100;
    chartData.forEach((row, i) => {
      const y = listY + i * rowH;
      if (y + 60 > cardY + cardH - 30) return; // clip
      const pct = totalCat > 0 ? (row.value / totalCat) * 100 : 0;

      // color dot
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.beginPath();
      ctx.arc(padX + 8, y + 20, 10, 0, Math.PI * 2);
      ctx.fill();

      // emoji + label
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "left";
      ctx.font = "500 30px ui-sans-serif, system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
      ctx.fillText(`${row.emoji}  ${row.label}`, padX + 36, y + 30);

      // right side: amount + pct
      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 28px ui-sans-serif, system-ui";
      ctx.fillText(formatCurrency(row.value, lang, currency), padX + listW, y + 22);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 22px ui-sans-serif, system-ui";
      ctx.fillText(`${pct.toFixed(1)}%`, padX + listW, y + 52);

      // mini progress bar
      const barY = y + 58;
      const barW = listW - 200;
      ctx.fillStyle = "#f1f5f9";
      roundRect(ctx, padX + 36, barY, barW, 8, 4);
      ctx.fill();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      roundRect(ctx, padX + 36, barY, (barW * pct) / 100, 8, 4);
      ctx.fill();
    });

    // Wallets section
    if (showWallets) {
      const wY = cardY + cardH + 30;
      const wH = 230;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, cardX, wY, cardW, wH, 36);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.font = "600 24px ui-sans-serif, system-ui";
      ctx.textAlign = "left";
      ctx.fillText(lang === "th" ? "กระเป๋าเงิน" : "Wallets", cardX + 40, wY + 45);

      const wallets = walletsWithBalance.slice(0, 4);
      wallets.forEach((w, i) => {
        const ry = wY + 90 + i * 35;
        if (ry > wY + wH - 20) return;
        ctx.fillStyle = "#0f172a";
        ctx.font = "500 26px ui-sans-serif, system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
        ctx.textAlign = "left";
        ctx.fillText(`${w.emoji}  ${w.name}`, cardX + 40, ry);
        ctx.textAlign = "right";
        ctx.font = "600 26px ui-sans-serif, system-ui";
        ctx.fillStyle = w.balance >= 0 ? "#0f172a" : "#dc2626";
        ctx.fillText(formatCurrency(w.balance, lang, currency), cardX + cardW - 40, ry);
      });
    }

    // Footer
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 22px ui-sans-serif, system-ui";
    ctx.fillText(
      `${lang === "th" ? "สร้างโดย Check Tang" : "Made with Check Tang"} · v${appConfig.currentVersion}`,
      W / 2,
      H - 50
    );

    return canvas.toDataURL("image/png");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataUrl = renderImage();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const filename = `checktang_summary_${timestamp}.png`;
      
      // เช็คการทำงานผ่านตัวแปรระดับบนของระบบ Capacitor โกลบอล
      const isNative = typeof window !== "undefined" && !!Capacitor?.isNativePlatform?.();

      if (isNative) {
        // ดึงปลั๊กอินอย่างปลอดภัยจากคอนเทนต์รันไทม์
        const Filesystem = Capacitor?.Plugins?.Filesystem;
        const Share = Capacitor?.Plugins?.Share;

        if (!Filesystem || !Share) {
          throw new Error("Capacitor Filesystem or Share plugin is not available natively.");
        }

        const base64 = dataUrl.split(",")[1];
        
        // บันทึกไฟล์ลง Cache แบบไม่ใช้ Enum โมดูล เพื่อความปลอดภัยของคอมไพเลอร์
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: 'CACHE',
          recursive: true,
        });
        const { uri } = await Filesystem.getUri({
        path: filename,
        directory: 'CACHE',
      });

      try {
        await Share.share({
          title: filename,
          text: lang === "th" ? "สรุปยอดเงิน Check Tang" : "Check Tang summary",
          files: [uri],
          dialogTitle: lang === "th" ? "บันทึก/แชร์รูปภาพ" : "Save / share image",
        });
      } catch (e) { /* User Cancelled */ }

      toast.success(
        lang === "th" 
          ? "เปิดหน้าต่างแชร์รูปภาพแล้ว" 
          : "Image share sheet opened",
        { duration: 5000 }
      );

    } else {
        // ส่วนจัดการบนบราวเซอร์ปกติ (Web-based fallback)
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: "image/png" });

        const navAny = navigator as Navigator & {
          canShare?: (data: { files?: File[] }) => boolean;
          share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
        };
        if (navAny.share && navAny.canShare?.({ files: [file] })) {
          try {
            await navAny.share({
              files: [file],
              title: filename,
              text: lang === "th" ? "สรุปยอดเงิน Check Tang" : "Check Tang summary",
            });
            toast.success(lang === "th" ? "บันทึกรูปภาพแล้ว" : "Image saved");
            onOpenChange(false);
            return;
          } catch (err) {
            if ((err as Error)?.name === "AbortError") {
              setIsExporting(false);
              return;
            }
          }
        }

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(lang === "th" ? "บันทึกรูปภาพแล้ว" : "Image saved");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Image export error:", error);
      toast.error(lang === "th" ? "บันทึกรูปล้มเหลว" : "Image export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Year options
  const yearOptions = useMemo(() => {
    const ys = new Set<number>();
    transactions.forEach((tx) => {
      const y = Number(tx.date.slice(0, 4));
      if (!Number.isNaN(y)) ys.add(y);
    });
    ys.add(now.getFullYear());
    return Array.from(ys).sort((a, b) => b - a);
  }, [transactions]);

  const monthNames = lang === "th"
    ? ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lang === "th" ? "บันทึกรูปสรุปยอด" : "Save Summary Image"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Period */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {lang === "th" ? "ช่วงเวลา" : "Period"}
            </Label>
            <Select value={periodKind} onValueChange={(v) => setPeriodKind(v as PeriodKind)}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">
                  {lang === "th" ? "เดือนนี้" : "This month"}
                </SelectItem>
                <SelectItem value="pick-month">
                  {lang === "th" ? "เลือกเดือน" : "Pick a month"}
                </SelectItem>
                <SelectItem value="range">
                  {lang === "th" ? "กำหนดช่วงเอง" : "Custom range"}
                </SelectItem>
                <SelectItem value="year">
                  {lang === "th" ? "ทั้งปี" : "Full year"}
                </SelectItem>
                <SelectItem value="all">
                  {lang === "th" ? "ทั้งหมด" : "All time"}
                </SelectItem>
              </SelectContent>
            </Select>

            {periodKind === "pick-month" && (
              <div className="grid grid-cols-2 gap-2">
                <Select value={String(pickMonth)} onValueChange={(v) => setPickMonth(Number(v))}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {monthNames.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(pickYear)} onValueChange={(v) => setPickYear(Number(v))}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {lang === "th" ? y + 543 : y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {periodKind === "year" && (
              <Select value={String(yearOnly)} onValueChange={(v) => setYearOnly(Number(v))}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {lang === "th" ? y + 543 : y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {periodKind === "range" && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="h-10 rounded-xl"
                />
                <Input
                  type="date"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {lang === "th" ? "ประเภท" : "Type"}
            </Label>
            <Select value={splitType} onValueChange={(v) => setSplitType(v as typeof splitType)}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">
                  {lang === "th" ? "เฉพาะรายจ่าย" : "Expense only"}
                </SelectItem>
                <SelectItem value="income">
                  {lang === "th" ? "เฉพาะรายรับ" : "Income only"}
                </SelectItem>
                <SelectItem value="both">
                  {lang === "th" ? "รายรับ + รายจ่าย" : "Income + Expense"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category scope */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {lang === "th" ? "หมวดหมู่" : "Categories"}
            </Label>
            <Select value={categoryScope} onValueChange={(v) => setCategoryScope(v as typeof categoryScope)}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top5">
                  {lang === "th" ? "Top 5 หมวด" : "Top 5"}
                </SelectItem>
                <SelectItem value="all">
                  {lang === "th" ? "ทุกหมวด (รวมเป็น \"อื่นๆ\")" : "All (rest in \"Other\")"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wallets toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">
                {lang === "th" ? "แสดงยอดคงเหลือกระเป๋า" : "Show wallet balances"}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "th" ? "ท้ายรูป แสดงยอดคงเหลือแต่ละกระเป๋า" : "Bottom of image"}
              </div>
            </div>
            <Switch checked={showWallets} onCheckedChange={setShowWallets} />
          </div>

          <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5">
            {lang === "th" ? "ช่วง: " : "Range: "} {label}
            {" · "}
            {lang === "th" ? "รายการ: " : "Transactions: "} {inPeriod.length}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {lang === "th" ? "ยกเลิก" : "Cancel"}
          </Button>
          <Button
            className="flex-1 rounded-xl"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {lang === "th" ? "บันทึกรูป" : "Save image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}