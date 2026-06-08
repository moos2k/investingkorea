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
        vertLines: { color: "#ffffff08", style: LineStyle.Solid },
        horzLines: { color: "#ffffff08", style: LineStyle.Solid },
      },
      rightPriceScale: {
        borderColor: "#ffffff10",
      },
      timeScale: {
        borderColor: "#ffffff10",
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: "#ffffff30", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "#ffffff30", width: 1, style: LineStyle.Dashed },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#f87171",
      downColor: "#60a5fa",
      borderUpColor: "#f87171",
      borderDownColor: "#60a5fa",
      wickUpColor: "#f87171",
      wickDownColor: "#60a5fa",
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
