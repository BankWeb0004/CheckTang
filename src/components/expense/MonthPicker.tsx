import { useStore } from "@/lib/expense-store";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export interface MonthValue {
  year: number;
  month: number; // 0-11
}

export function nowMonth(): MonthValue {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isSameMonth(a: MonthValue, b: MonthValue) {
  return a.year === b.year && a.month === b.month;
}

/** Local-timezone safe: keep transactions in their own month even at boundaries. */
export function isTxInMonth(dateStr: string, m: MonthValue): boolean {
  // dateStr is "YYYY-MM-DD" stored locally; parse manually to avoid TZ drift
  const [y, mo] = dateStr.split("-").map(Number);
  if (!y || !mo) return false;
  return y === m.year && mo - 1 === m.month;
}

interface Props {
  value: MonthValue;
  onChange: (m: MonthValue) => void;
}

export function MonthPicker({ value, onChange }: Props) {
  const { lang } = useStore();
  const current = nowMonth();
  const isCurrent = isSameMonth(value, current);

  const shift = (delta: number) => {
    const d = new Date(value.year, value.month + delta, 1);
    onChange({ year: d.getFullYear(), month: d.getMonth() });
  };

  const label = new Date(value.year, value.month, 1).toLocaleDateString(
    lang === "th" ? "th-TH" : "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-2 py-1.5">
      <button
        onClick={() => shift(-1)}
        className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
        aria-label="prev month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex-1 text-center text-sm font-semibold text-foreground tabular-nums">
        {label}
      </div>
      {!isCurrent && (
        <button
          onClick={() => onChange(current)}
          className="h-8 px-2 rounded-xl flex items-center gap-1 hover:bg-muted transition-colors text-[10px] text-muted-foreground"
          aria-label="reset to current month"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
      <button
        onClick={() => shift(1)}
        className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
        aria-label="next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
