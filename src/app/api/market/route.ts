import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YF = require("yahoo-finance2").default;
// yahoo-finance2 v3 requires instantiation
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

const SYMBOLS = {
  indices: [
    { symbol: "^GSPC", name: "S&P 500", flag: "🇺🇸" },
    { symbol: "^IXIC", name: "NASDAQ", flag: "🇺🇸" },
    { symbol: "^DJI", name: "다우존스", flag: "🇺🇸" },
    { symbol: "^KS11", name: "KOSPI", flag: "🇰🇷" },
    { symbol: "^N225", name: "닛케이", flag: "🇯🇵" },
  ],
  bonds: [
    { symbol: "^IRX", name: "미국 3M", maturity: "3M" },
    { symbol: "^FVX", name: "미국 5Y", maturity: "5Y" },
    { symbol: "^TNX", name: "미국 10Y", maturity: "10Y" },
    { symbol: "^TYX", name: "미국 30Y", maturity: "30Y" },
  ],
  forex: [
    { symbol: "USDKRW=X", name: "USD/KRW", base: "USD", quote: "KRW" },
    { symbol: "USDJPY=X", name: "USD/JPY", base: "USD", quote: "JPY" },
    { symbol: "EURUSD=X", name: "EUR/USD", base: "EUR", quote: "USD" },
    { symbol: "EURKRW=X", name: "EUR/KRW", base: "EUR", quote: "KRW" },
  ],
  commodities: [
    { symbol: "GC=F", name: "금 (Gold)", unit: "USD/oz" },
    { symbol: "CL=F", name: "WTI 원유", unit: "USD/bbl" },
    { symbol: "SI=F", name: "은 (Silver)", unit: "USD/oz" },
    { symbol: "NG=F", name: "천연가스", unit: "USD/MMBtu" },
  ],
  fear: [
    { symbol: "^VIX", name: "VIX 공포지수" },
  ],
};

async function fetchQuotes(symbols: string[]) {
  const results: Record<string, { price: number; change: number; changePercent: number; prevClose: number; name?: string }> = {};
  try {
    const quotes = await Promise.allSettled(
      symbols.map((s) => yf.quote(s))
    );
    quotes.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        const q = result.value;
        results[symbols[i]] = {
          price: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
          prevClose: q.regularMarketPreviousClose ?? 0,
          name: q.shortName || q.longName || symbols[i],
        };
      }
    });
  } catch (e) {
    console.error("fetchQuotes error", e);
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 사용자 관심종목 (콤마 구분, 예: ?watch=AAPL,005930.KS)
  const watchParam = searchParams.get("watch") ?? "";
  const watchSymbols = watchParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allSymbols = [
    ...SYMBOLS.indices.map((x) => x.symbol),
    ...SYMBOLS.bonds.map((x) => x.symbol),
    ...SYMBOLS.forex.map((x) => x.symbol),
    ...SYMBOLS.commodities.map((x) => x.symbol),
    ...SYMBOLS.fear.map((x) => x.symbol),
    ...watchSymbols,
  ];

  const quotes = await fetchQuotes(allSymbols);

  const attach = (items: { symbol: string; [k: string]: unknown }[]) =>
    items.map((item) => ({
      ...item,
      ...(quotes[item.symbol] ?? { price: null, change: null, changePercent: null }),
    }));

  const watchlist = watchSymbols.map((symbol) => {
    const q = quotes[symbol];
    return {
      symbol,
      name: q?.name ?? symbol,
      price: q?.price ?? null,
      change: q?.change ?? null,
      changePercent: q?.changePercent ?? null,
    };
  });

  return NextResponse.json(
    {
      indices: attach(SYMBOLS.indices),
      bonds: attach(SYMBOLS.bonds),
      forex: attach(SYMBOLS.forex),
      commodities: attach(SYMBOLS.commodities),
      fear: attach(SYMBOLS.fear),
      watchlist,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}
