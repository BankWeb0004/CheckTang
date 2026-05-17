export function CheckTangLogo() {
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <svg
        width="72"
        height="56"
        viewBox="0 0 72 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* curved base line */}
        <path
          d="M6 46 Q36 28 66 46"
          stroke="oklch(0.28 0.06 240)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* left large circle */}
        <circle cx="22" cy="36" r="13" fill="oklch(0.28 0.06 240)" />
        <circle cx="22" cy="36" r="8.5" fill="oklch(0.97 0.01 240)" />
        <circle cx="22" cy="36" r="5" fill="oklch(0.28 0.06 240)" />
        {/* right medium circle */}
        <circle cx="44" cy="32" r="10" fill="oklch(0.28 0.06 240)" />
        <circle cx="44" cy="32" r="6.5" fill="oklch(0.97 0.01 240)" />
        <circle cx="44" cy="32" r="3.8" fill="oklch(0.28 0.06 240)" />
        {/* top small circle */}
        <circle cx="36" cy="13" r="7.5" fill="oklch(0.28 0.06 240)" />
        <circle cx="36" cy="13" r="4.5" fill="oklch(0.97 0.01 240)" />
        <circle cx="36" cy="13" r="2.5" fill="oklch(0.28 0.06 240)" />
      </svg>
      <span
        className="font-bold text-xl leading-tight"
        style={{ color: "oklch(0.28 0.06 240)", fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui" }}
      >
        เช็คตังค์
      </span>
      <span
        className="text-xs font-semibold tracking-widest"
        style={{ color: "oklch(0.5 0.04 240)", letterSpacing: "0.15em", fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif" }}
      >
        CHECK TANG
      </span>
    </div>
  );
}
