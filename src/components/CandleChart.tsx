"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
  LineStyle,
} from "lightweight-charts";

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleChartProps {
  data: CandleData[];
}

export default function CandleChart({ data }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
      },
      grid: {
        vertLines: { color: "#00000008", style: LineStyle.Solid },
        horzLines: { color: "#00000008", style: LineStyle.Solid },
      },
      rightPriceScale: {
        borderColor: "#00000014",
      },
      timeScale: {
        borderColor: "#00000014",
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: "#00000030", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "#00000030", width: 1, style: LineStyle.Dashed },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#f43f5e",
      downColor: "#3b82f6",
      borderUpColor: "#f43f5e",
      borderDownColor: "#3b82f6",
      wickUpColor: "#f43f5e",
      wickDownColor: "#3b82f6",
    });

    const formatted = data.map((d) => ({
      time: d.date as `${number}-${number}-${number}`,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeries.setData(formatted);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full h-full" />;
}
