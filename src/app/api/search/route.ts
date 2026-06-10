import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YF = require("yahoo-finance2").default;
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const result = await yf.search(q, { quotesCount: 10, newsCount: 0 });

    const results = (result.quotes ?? [])
      .filter((item: { isYahooFinance?: boolean; symbol?: string }) => item.symbol)
      .map((item: { symbol: string; shortname?: string; longname?: string; quoteType?: string; exchange?: string }) => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        type: item.quoteType,
        exchange: item.exchange,
      }));

    return NextResponse.json({ results });
  } catch (e) {
    console.error("search error", e);
    return NextResponse.json({ results: [] });
  }
}
