// 대시보드에 표시되는 기본 심볼 목록 (API 라우트 + 설정 패널 공용)
export const MARKET_SYMBOLS = {
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
} as const;
