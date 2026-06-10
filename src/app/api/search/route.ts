import { NextResponse } from "next/server";
import { searchKrStocks } from "@/lib/krStocks";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YF = require("yahoo-finance2").default;
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

interface SearchItem {
  symbol: string;
  name: string;
  type?: string;
  exchange?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  // 1. 국내 종목 한글/영문 로컬 검색 (Yahoo는 한글 검색 미지원)
  const krResults: SearchItem[] = searchKrStocks(q, 5).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    type: "EQUITY",
    exchange: s.market,
  }));

  // 한글이 포함된 검색어는 Yahoo 검색을 건너뛴다 (어차피 결과 없음)
  const hasKorean = /[가-힣]/.test(q);
  let yahooResults: SearchItem[] = [];

  if (!hasKorean) {
    try {
      const result = await yf.search(q, { quotesCount: 10, newsCount: 0 });
      yahooResults = (result.quotes ?? [])
        .filter((item: { symbol?: string }) => item.symbol)
        .map((item: { symbol: string; shortname?: string; longname?: string; quoteType?: string; exchange?: string }) => ({
          symbol: item.symbol,
          name: item.shortname || item.longname || item.symbol,
          type: item.quoteType,
          exchange: item.exchange,
        }));
    } catch (e) {
      console.error("search error", e);
    }
  }

  // 중복 제거 (한국 종목 우선)
  const seen = new Set(krResults.map((r) => r.symbol));
  const merged = [...krResults, ...yahooResults.filter((r) => !seen.has(r.symbol))];

  return NextResponse.json({ results: merged.slice(0, 10) });
}
