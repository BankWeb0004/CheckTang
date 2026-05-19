export function CheckTangNeonIcon({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#0066ff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main rounded square background */}
      <rect x="12" y="8" width="96" height="96" rx="16" fill="#1a1a2e" />

      {/* Grid pattern at bottom */}
      <g opacity="0.3" stroke="url(#neonGradient)" strokeWidth="0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="20"
            y1={72 + i * 4}
            x2="100"
            y2={72 + i * 4}
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={20 + i * 16}
            y1="72"
            x2={20 + i * 16}
            y2="88"
          />
        ))}
      </g>

      {/* Large magnifying glass (main search icon) */}
      <g filter="url(#neonGlow)">
        {/* Circle of large magnifying glass */}
        <circle
          cx="50"
          cy="35"
          r="16"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="2.5"
        />
        {/* Handle of large magnifying glass */}
        <line
          x1="62"
          y1="47"
          x2="72"
          y2="57"
          stroke="url(#neonGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Small magnifying glass (top right) */}
      <g filter="url(#neonGlow)">
        {/* Circle of small magnifying glass */}
        <circle
          cx="72"
          cy="25"
          r="10"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="2"
        />
        {/* Handle of small magnifying glass */}
        <line
          x1="80"
          y1="33"
          x2="87"
          y2="40"
          stroke="url(#neonGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Top left small circle (person icon element) */}
      <circle
        cx="52"
        cy="18"
        r="3.5"
        fill="url(#neonGradient)"
        filter="url(#neonGlow)"
      />
    </svg>
  );
}
