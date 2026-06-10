"use client";

interface MarketListItemProps {
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
  onRemove?: () => void;
}

export default function MarketListItem({
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
  onRemove,
}: MarketListItemProps) {
  const isUp = (change ?? 0) >= 0;
  const color = isUp ? "text-rose-500" : "text-blue-500";
  const arrow = isUp ? "▲" : "▼";

  return (
    <div
      className={`group flex items-center justify-between gap-3 px-4 py-3 ${onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        {flag && <span className="text-base leading-none">{flag}</span>}
        {maturity && (
          <span className="bg-gray-100 rounded px-1.5 py-0.5 text-xs text-gray-600 font-medium flex-shrink-0">
            {maturity}
          </span>
        )}
        <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
        {unit && <span className="text-xs text-gray-400 flex-shrink-0">{unit}</span>}
        {!!delay && (
          <span className="bg-amber-100 text-amber-700 rounded px-1 text-[10px] font-normal flex-shrink-0">
            {delay}분 지연
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {price !== null ? (
          <>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </span>
            <span className={`text-xs font-medium ${color} tabular-nums whitespace-nowrap`}>
              {arrow} {Math.abs(change ?? 0).toFixed(decimals)}{" "}
              <span>({isUp ? "+" : ""}{(changePercent ?? 0).toFixed(2)}%)</span>
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400">로딩 중...</span>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all flex-shrink-0"
            title="삭제"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
