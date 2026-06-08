"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import dynamic from "next/dynamic";

const CandleChart = dynamic(() => import("./CandleChart"), { ssr: false });

type ChartType = "area" | "candle";

const PERIODS = ["1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "10Y", "MAX"] as const;
type Period = (typeof PERIODS)[number];

interface HistoryPoint {
  date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface ChartModalProps {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  onClose: () => void;
}

function formatDate(dateStr: string, period: Period) {
  const d = new Date(dateStr);
  if (period === "1W") return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  if (period === "1M") return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function formatPrice(v: number) {
  if (v >= 10000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (v >= 100) return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return v.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, period }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as HistoryPoint;
  return (
    <div className="bg-[#1a2035] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <div className="text-gray-400 mb-1">{formatDate(label, period)}</div>
      <div className="text-white font-bold text-sm">{formatPrice(d.close)}</div>
      <div className="text-gray-400 mt-1">
        고가 <span className="text-red-400">{formatPrice(d.high)}</span>{" "}
        저가 <span className="text-blue-400">{formatPrice(d.low)}</span>
      </div>
    </div>
  );
}

export default function ChartModal({ symbol, name, price, changePercent, onClose }: ChartModalProps) {
  const [period, setPeriod] = useState<Period>("1M");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&period=${period}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isUp = (changePercent ?? 0) >= 0;
  const color = isUp ? "#f87171" : "#60a5fa";
  const gradientId = `grad-${symbol.replace(/[^a-z0-9]/gi, "")}`;

  // 차트 변화율 계산 (표시 기간 기준)
  const periodChange =
    data.length >= 2
      ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
      : null;
  const periodUp = (periodChange ?? 0) >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <div className="text-xs text-gray-400 mt-0.5">{symbol}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white tabular-nums">
              {price !== null ? formatPrice(price) : "-"}
            </div>
            {changePercent !== null && (
              <div className={`text-sm font-medium ${isUp ? "text-red-400" : "text-blue-400"}`}>
                {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Period selector + Chart type toggle */}
        <div className="flex gap-1 px-5 mb-4 items-center">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-white/15 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p}
            </button>
          ))}

          {/* chart type toggle */}
          <div className="ml-auto flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setChartType("area")}
              title="라인 차트"
              className={`px-2.5 py-1 text-xs transition-colors ${
                chartType === "area" ? "bg-white/15 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              〰
            </button>
            <button
              onClick={() => setChartType("candle")}
              title="캔들 차트"
              className={`px-2.5 py-1 text-xs transition-colors border-l border-white/10 ${
                chartType === "candle" ? "bg-white/15 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ▌▌
            </button>
          </div>

          {periodChange !== null && (
            <span className={`ml-3 text-xs font-medium ${periodUp ? "text-red-400" : "text-blue-400"}`}>
              {periodUp ? "▲" : "▼"} {Math.abs(periodChange).toFixed(2)}% ({period})
            </span>
          )}
        </div>

        {/* Chart */}
        <div className="px-2 pb-5 h-64">
          {loading && (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm animate-pulse">
              차트 로딩 중...
            </div>
          )}
          {error && (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              데이터를 불러올 수 없습니다
            </div>
          )}
          {!loading && !error && data.length > 0 && chartType === "area" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(v, period)}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => formatPrice(v)}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip period={period} />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: "white", strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {!loading && !error && data.length > 0 && chartType === "candle" && (
            <CandleChart data={data} />
          )}
        </div>
      </div>
    </div>
  );
}
