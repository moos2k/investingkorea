"use client";

interface MarketCardProps {
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  unit?: string;
  flag?: string;
  maturity?: string;
  decimals?: number;
  onClick?: () => void;
}

export default function MarketCard({
  name,
  price,
  change,
  changePercent,
  unit,
  flag,
  maturity,
  decimals = 2,
  onClick,
}: MarketCardProps) {
  const isUp = (change ?? 0) >= 0;
  const color = isUp ? "text-red-400" : "text-blue-400";
  const bg = isUp ? "bg-red-400/5" : "bg-blue-400/5";
  const arrow = isUp ? "▲" : "▼";

  return (
    <div
      className={`rounded-xl border border-white/10 p-4 ${bg} backdrop-blur-sm ${onClick ? "cursor-pointer hover:border-white/25 hover:bg-white/5 transition-all" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-gray-400 font-medium">
            {flag && <span className="mr-1">{flag}</span>}
            {maturity && (
              <span className="bg-white/10 rounded px-1 mr-1 text-gray-300">
                {maturity}
              </span>
            )}
            {name}
          </div>
          {unit && <div className="text-xs text-gray-500 mt-0.5">{unit}</div>}
        </div>
      </div>
      {price !== null ? (
        <>
          <div className="text-xl font-bold text-white tabular-nums">
            {price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          </div>
          <div className={`text-sm font-medium mt-1 ${color} tabular-nums`}>
            {arrow} {Math.abs(change ?? 0).toFixed(decimals)}{" "}
            <span className="text-xs">
              ({isUp ? "+" : ""}{(changePercent ?? 0).toFixed(2)}%)
            </span>
          </div>
        </>
      ) : (
        <div className="text-gray-500 text-sm mt-2">로딩 중...</div>
      )}
    </div>
  );
}
