// 대시보드에 표시되는 기본 심볼 목록 (API 라우트 + 설정 패널 공용)
// delay: Yahoo Finance 데이터의 대략적인 지연(분). 0이면 실시간에 가까움.
export const MARKET_SYMBOLS = {
  indices: [
    { symbol: "^GSPC", name: "S&P 500", flag: "🇺🇸", delay: 15 },
    { symbol: "^IXIC", name: "NASDAQ", flag: "🇺🇸", delay: 15 },
    { symbol: "^DJI", name: "다우존스", flag: "🇺🇸", delay: 15 },
    { symbol: "^KS11", name: "KOSPI", flag: "🇰🇷", delay: 20 },
    { symbol: "^N225", name: "닛케이", flag: "🇯🇵", delay: 20 },
  ],
  bonds: [
    { symbol: "^IRX", name: "미국 3M", maturity: "3M", delay: 15 },
    { symbol: "^FVX", name: "미국 5Y", maturity: "5Y", delay: 15 },
    { symbol: "^TNX", name: "미국 10Y", maturity: "10Y", delay: 15 },
    { symbol: "^TYX", name: "미국 30Y", maturity: "30Y", delay: 15 },
  ],
  forex: [
    { symbol: "USDKRW=X", name: "USD/KRW", base: "USD", quote: "KRW", delay: 0 },
    { symbol: "USDJPY=X", name: "USD/JPY", base: "USD", quote: "JPY", delay: 0 },
    { symbol: "EURUSD=X", name: "EUR/USD", base: "EUR", quote: "USD", delay: 0 },
    { symbol: "EURKRW=X", name: "EUR/KRW", base: "EUR", quote: "KRW", delay: 0 },
  ],
  commodities: [
    { symbol: "GC=F", name: "금 (Gold)", unit: "USD/oz", delay: 10 },
    { symbol: "CL=F", name: "WTI 원유", unit: "USD/bbl", delay: 10 },
    { symbol: "SI=F", name: "은 (Silver)", unit: "USD/oz", delay: 10 },
    { symbol: "NG=F", name: "천연가스", unit: "USD/MMBtu", delay: 10 },
  ],
  fear: [
    { symbol: "^VIX", name: "VIX 공포지수", delay: 15 },
  ],
} as const;

/**
 * 심볼 패턴으로 관심종목(watchlist)의 대략적인 지연 시간을 추정
 */
export function estimateDelay(symbol: string): number {
  if (symbol.endsWith("=X")) return 0; // 환율
  if (symbol.endsWith("=F")) return 10; // 선물/원자재
  if (symbol.endsWith(".KS") || symbol.endsWith(".KQ")) return 20; // 한국 주식
  if (symbol.startsWith("^")) return 15; // 지수
  return 15; // 기본 (해외 주식)
}
