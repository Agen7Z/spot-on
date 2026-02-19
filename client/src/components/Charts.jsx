import React from "react";

export function Charts({ data = [], width = 360, height = 180 }) {
  const [hover, setHover] = React.useState(null);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  if (!data || data.length === 0) return null;

  const max = Math.max(...data) + 2;
  const min = Math.min(...data) - 2;
  const range = max - min || 5;

  const padding = 40;
  const innerW = width - padding * 2;
  const barW = innerW / data.length;

  const points = data.map((d, i) => {
    const x = padding + i * barW + barW / 2;
    const y =
      height -
      padding -
      ((d - min) / range) * (height - padding * 2);

    return { x, y, v: d, i };
  });

  // Smooth curve (quadratic bezier)
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    const cy = (prev.y + p.y) / 2;
    return acc + ` Q ${prev.x},${prev.y} ${cx},${cy}`;
  }, "");

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-white/60 to-pink-50/40 backdrop-blur-xl p-6 shadow-xl border border-white/30">
      <svg width={width} height={height} className="mx-auto block">

        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <linearGradient id="lineGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f3f4f6"
            />
          );
        })}

        {/* Bars */}
        {points.map((p, i) => {
          const barHeight = height - padding - p.y;
          return (
            <rect
              key={i}
              x={p.x - barW / 4}
              y={animate ? p.y : height - padding}
              width={barW * 0.5}
              height={animate ? barHeight : 0}
              rx={8}
              fill="url(#barGrad)"
              opacity="0.85"
              style={{ transition: "all 0.6s ease" }}
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}

        {/* Glow under line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={6}
          opacity="0.15"
          filter="url(#glow)"
        />

        {/* Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#fff"
            stroke="#ec4899"
            strokeWidth={2}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="absolute z-20 -translate-x-1/2 rounded-xl bg-white/80 backdrop-blur-lg px-4 py-2 text-sm shadow-xl border border-white/40"
          style={{ left: hover.x, top: hover.y - 50 }}
        >
          <div className="font-semibold text-neutral-900">
            {hover.v} days
          </div>
          <div className="text-neutral-500 text-xs">
            Cycle #{hover.i + 1}
          </div>
        </div>
      )}
    </div>
  );
}

  // Monthly period-days bar chart
  export function MonthlyPeriodChart({ labels = [], data = [], width = 720, height = 160, colorFrom = "#fb7185", colorTo = "#f43f5e" }) {
    const [hover, setHover] = React.useState(null);
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const paddingLeft = 36;
    const padding = 12;
    const innerW = width - paddingLeft - padding;
    const barW = innerW / Math.max(data.length, 1);
    const ticks = 4;

    return (
      <div className="relative">
        <svg width={width} height={height} className="block mx-auto">
          <defs>
            <linearGradient id="monthGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={colorFrom} stopOpacity="0.98" />
              <stop offset="100%" stopColor={colorTo} stopOpacity="0.85" />
            </linearGradient>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.06" />
            </filter>
          </defs>

          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const ratio = i / ticks;
            const y = padding + ratio * (height - padding - 40);
            const val = Math.round((1 - ratio) * max);
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                <text x={paddingLeft - 8} y={y + 4} fontSize={11} fill="#9ca3af" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const h = (d / max) * (height - padding - 40);
            const x = paddingLeft + i * barW + barW * 0.08;
            const w = barW * 0.84;
            const y = height - 36 - h;
            return (
              <g key={i} onMouseEnter={() => setHover({ i, d, x, y })} onMouseLeave={() => setHover(null)}>
                <rect x={x} y={y} width={w} height={h} rx={8} fill="url(#monthGrad)" filter="url(#softShadow)" />
                <text x={x + w / 2} y={height - 14} fontSize={12} fill="#6b7280" textAnchor="middle">{labels[i]}</text>
              </g>
            );
          })}

          <line x1={paddingLeft} y1={height - 36} x2={width - padding} y2={height - 36} stroke="#e6e6e6" strokeWidth={1} />
        </svg>

        {hover && (
          <div className="pointer-events-none absolute z-20 rounded-md bg-white/98 px-3 py-2 text-sm shadow-lg" style={{ left: hover.x + 12, top: Math.max(6, hover.y - 44) }}>
            <div className="font-semibold text-neutral-900">{hover.d} days</div>
            <div className="text-neutral-500">{labels[hover.i]}</div>
          </div>
        )}
      </div>
    );
  }