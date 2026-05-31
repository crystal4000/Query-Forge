"use client"

const SIZE = 224
const STROKE = 4

export function PageLoader() {
  const r = (SIZE - STROKE) / 2
  const cx = SIZE / 2
  const cy = SIZE / 2
  const circumference = 2 * Math.PI * r
  const arc = circumference * 0.28

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading QueryForge"
    >
      <div className="relative flex flex-col items-center gap-6">
        <div
          className="relative flex items-center justify-center"
          style={{ width: SIZE, height: SIZE }}
        >
          <svg
            className="absolute inset-0"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            aria-hidden
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity={0.15}
              strokeWidth={STROKE}
            />
            <g>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${arc} ${circumference - arc}`}
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${cx} ${cy}`}
                to={`360 ${cx} ${cy}`}
                dur="1s"
                repeatCount="indefinite"
              />
            </g>
          </svg>
          <span className="relative z-10 text-[6rem] sm:text-[7.5rem] leading-none font-mono font-bold text-accent tracking-tighter select-none">
            QF
          </span>
        </div>
        <span className="text-sm font-medium tracking-[0.25em] text-text-muted uppercase">
          QueryForge
        </span>
      </div>
    </div>
  )
}
