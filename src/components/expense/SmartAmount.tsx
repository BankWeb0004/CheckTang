import { useStore, splitCurrency } from "@/lib/expense-store";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  className?: string;
  decimalClassName?: string;
  /** Force a color (otherwise auto: negative => expense red, else inherit) */
  colorize?: boolean;
  prefix?: string;
}

/**
 * Smart decimal typography:
 *  - integer part: full size, full opacity
 *  - decimal (.dd): 65% size, 60% opacity
 *  - negative balance: flips to soft pastel expense color
 */
export function SmartAmount({
  value,
  className,
  decimalClassName,
  colorize = true,
  prefix = "",
}: Props) {
  const { lang, currency } = useStore();
  const { sign, symbol, integer, fraction } = splitCurrency(value, lang, currency);
  const negative = value < 0;

  return (
    <span
      className={cn("tabular-nums tracking-tight transition-colors", className)}
      style={colorize && negative ? { color: "var(--expense)" } : undefined}
    >
      {prefix}
      {sign}
      <span className="opacity-80">{symbol}</span>
      {integer}
      {fraction && (
        <span
          className={cn("opacity-60", decimalClassName)}
          style={{ fontSize: "0.65em", fontWeight: 500 }}
        >
          {fraction}
        </span>
      )}
    </span>
  );
}
