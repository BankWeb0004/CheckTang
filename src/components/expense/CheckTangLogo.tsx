import { cn } from "@/lib/utils";

export function CheckTangLogo({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-1 select-none text-current", className)}>
      <svg
        className="h-14 w-auto text-current"
        viewBox="0 0 72 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* curved base line */}
        <path
          d="M6 46 Q36 28 66 46"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* left large circle */}
        <circle cx="22" cy="36" r="13" fill="currentColor" />
        <circle cx="22" cy="36" r="8.5" fill="currentColor" />
        <circle cx="22" cy="36" r="5" fill="currentColor" />
        {/* right medium circle */}
        <circle cx="44" cy="32" r="10" fill="currentColor" />
        <circle cx="44" cy="32" r="6.5" fill="currentColor" />
        <circle cx="44" cy="32" r="3.8" fill="currentColor" />
        {/* top small circle */}
        <circle cx="36" cy="13" r="7.5" fill="currentColor" />
        <circle cx="36" cy="13" r="4.5" fill="currentColor" />
        <circle cx="36" cy="13" r="2.5" fill="currentColor" />
      </svg>
      {showLabel ? (
        <>
          <span className="font-bold text-xl leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui" }}>
            เช็คตังค์
          </span>
          <span className="text-xs font-semibold tracking-[0.25em]" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif" }}>
            CHECK TANG
          </span>
        </>
      ) : null}
    </div>
  );
}
