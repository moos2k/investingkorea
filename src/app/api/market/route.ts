import { NextResponse } from "next/server";
import { MARKET_SYMBOLS as SYMBOLS, estimateDelay } from "@/lib/marketSymbols";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YF = require("yahoo-finance2").default;
// yahoo-finance2 v3 requires instantiation
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

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

  const attach = <T extends { symbol: string }>(items: readonly T[]) =>
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
      delay: estimateDelay(symbol),
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
