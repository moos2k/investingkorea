import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YF = require("yahoo-finance2").default;
const yf = new YF({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

type IntervalType = "1d" | "1wk" | "1mo";

const PERIOD_CONFIG: Record<string, { days: number | null; interval: IntervalType }> = {
  "1W":  { days: 7,    interval: "1d" },
  "1M":  { days: 30,   interval: "1d" },
  "3M":  { days: 90,   interval: "1d" },
  "6M":  { days: 180,  interval: "1d" },
  "1Y":  { days: 365,  interval: "1d" },
  "3Y":  { days: 1095, interval: "1wk" },
  "5Y":  { days: 1825, interval: "1wk" },
  "10Y": { days: 3650, interval: "1mo" },
  "MAX": { days: null,  interval: "1mo" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") ?? "1M";

  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  const config = PERIOD_CONFIG[period] ?? PERIOD_CONFIG["1M"];
  const end = new Date();
  const start = config.days === null ? new Date("1950-01-01") : new Date();
  if (config.days !== null) start.setDate(start.getDate() - config.days);

  try {
    const result = await yf.chart(symbol, {
      period1: start.toISOString().split("T")[0],
      period2: end.toISOString().split("T")[0],
      interval: config.interval,
    });

    const data = (result.quotes ?? [])
      .filter((d: { close: number | null }) => d.close !== null)
      .map((d: { date: Date; close: number; open: number; high: number; low: number; volume: number }) => ({
        date: d.date.toISOString().split("T")[0],
        close: d.close,
        open: d.open ?? d.close,
        high: d.high ?? d.close,
        low: d.low ?? d.close,
        volume: d.volume ?? 0,
      }));

    return NextResponse.json({ symbol, period, data });
  } catch (e) {
    console.error("history error", e);
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
