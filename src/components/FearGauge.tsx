"use client";

interface FearGaugeProps {
  vix: number | null;
  changePercent: number | null;
  layout?: "full" | "row";
}

function getLabel(vix: number) {
  if (vix < 12) return { text: "극도의 안정", color: "#22c55e" };
  if (vix < 20) return { text: "안정", color: "#86efac" };
  if (vix < 30) return { text: "경계", color: "#facc15" };
  if (vix < 40) return { text: "공포", color: "#f97316" };
  return { text: "극도의 공포", color: "#ef4444" };
}

function GaugeArc({ vix, className }: { vix: number; className?: string }) {
  // gauge: 0~50 mapped to 0~180 degrees
  const angle = Math.min((vix / 50) * 180, 180);
  const rad = (angle - 90) * (Math.PI / 180);
  const nx = 50 + 35 * Math.cos(rad);
  const ny = 50 + 35 * Math.sin(rad);

  return (
    <svg viewBox="0 0 100 55" className={className}>
      {/* Background arc */}
      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
      {/* Color segments */}
      <path d="M 10 50 A 40 40 0 0 1 30 17" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
      <path d="M 30 17 A 40 40 0 0 1 50 10" fill="none" stroke="#86efac" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
      <path d="M 50 10 A 40 40 0 0 1 70 17" fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
      <path d="M 70 17 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
      {/* Needle */}
      <line x1="50" y1="50" x2={nx} y2={ny} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="#1f2937" />
    </svg>
  );
}

export default function FearGauge({ vix, changePercent, layout = "full" }: FearGaugeProps) {
  if (vix === null) return <div className="text-gray-400 text-sm">로딩 중...</div>;

  const { text, color } = getLabel(vix);

  if (layout === "row") {
    return (
      <div className="flex items-center gap-3">
        <GaugeArc vix={vix} className="w-12 flex-shrink-0" />
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900 tabular-nums">{vix.toFixed(2)}</div>
          <div className="text-xs font-medium" style={{ color }}>{text}</div>
        </div>
        {changePercent !== null && (
          <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${changePercent >= 0 ? "text-rose-500" : "text-blue-500"}`}>
            {changePercent >= 0 ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <GaugeArc vix={vix} className="w-full max-w-[160px]" />
      <div className="text-2xl font-bold text-gray-900 tabular-nums">{vix.toFixed(2)}</div>
      <div className="text-sm font-medium mt-0.5" style={{ color }}>{text}</div>
      {changePercent !== null && (
        <div className={`text-xs mt-1 ${changePercent >= 0 ? "text-rose-500" : "text-blue-500"}`}>
          {changePercent >= 0 ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
        </div>
      )}
    </div>
  );
}
