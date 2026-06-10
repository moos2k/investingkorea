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
  delay?: number;
  onClick?: () => void;
  className?: string;
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
  delay,
  onClick,
  className = "",
}: MarketCardProps) {
  const isUp = (change ?? 0) >= 0;
  const color = isUp ? "text-rose-500" : "text-blue-500";
  const bg = isUp ? "bg-rose-50" : "bg-blue-50";
  const arrow = isUp ? "▲" : "▼";

  return (
    <div
      className={`rounded-xl border border-gray-200 p-4 ${bg} shadow-sm ${onClick ? "cursor-pointer hover:border-gray-300 hover:shadow-md transition-all" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-gray-500 font-medium flex items-center flex-wrap gap-1">
            {flag && <span>{flag}</span>}
            {maturity && (
              <span className="bg-gray-200 rounded px-1 text-gray-600">
                {maturity}
              </span>
            )}
            <span>{name}</span>
            {!!delay && (
              <span className="bg-amber-100 text-amber-700 rounded px-1 text-[10px] font-normal">
                {delay}분 지연
              </span>
            )}
          </div>
          {unit && <div className="text-xs text-gray-400 mt-0.5">{unit}</div>}
        </div>
      </div>
      {price !== null ? (
        <>
          <div className="text-xl font-bold text-gray-900 tabular-nums">
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
        <div className="text-gray-400 text-sm mt-2">로딩 중...</div>
      )}
    </div>
  );
}
