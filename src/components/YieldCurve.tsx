"use client";

interface Bond {
  maturity: string;
  price: number | null;
  changePercent: number | null;
}

export default function YieldCurve({ bonds }: { bonds: Bond[] }) {
  const valid = bonds.filter((b) => b.price !== null && b.price > 0);
  if (valid.length < 2) return null;

  const max = Math.max(...valid.map((b) => b.price!));
  const min = Math.min(...valid.map((b) => b.price!));
  const range = max - min || 0.1;
  const H = 60;
  const W = 100;
  const step = W / (valid.length - 1);

  const points = valid.map((b, i) => {
    const x = i * step;
    const y = H - ((b.price! - min) / range) * (H - 8) - 4;
    return { x, y, ...b };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="mt-3">
      <div className="text-xs text-gray-500 mb-2">수익률 곡선 (Yield Curve)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ycGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>
        <path d={pathD} fill="none" stroke="url(#ycGrad)" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" opacity="0.8" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        {valid.map((b) => (
          <span key={b.maturity}>{b.maturity}</span>
        ))}
      </div>
    </div>
  );
}
