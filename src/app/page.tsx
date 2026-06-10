"use client";

import { useState } from "react";
import useSWR from "swr";
import MarketCard from "@/components/MarketCard";
import YieldCurve from "@/components/YieldCurve";
import FearGauge from "@/components/FearGauge";
import EconCalendar from "@/components/EconCalendar";
import ChartModal from "@/components/ChartModal";
import SettingsPanel from "@/components/SettingsPanel";
import AddStockModal from "@/components/AddStockModal";
import { useSettings } from "@/lib/useSettings";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MarketItem {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  flag?: string;
  maturity?: string;
  unit?: string;
}

interface MarketData {
  indices: MarketItem[];
  bonds: MarketItem[];
  forex: MarketItem[];
  commodities: MarketItem[];
  fear: MarketItem[];
  watchlist: MarketItem[];
  updatedAt: string;
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5 animate-pulse">
      <div className="h-3 bg-white/10 rounded mb-3 w-2/3" />
      <div className="h-6 bg-white/10 rounded mb-2 w-1/2" />
      <div className="h-3 bg-white/10 rounded w-1/3" />
    </div>
  );
}

interface SelectedItem {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

export default function Dashboard() {
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);

  const {
    settings,
    loaded,
    isVisible,
    isSymbolVisible,
    toggleSection,
    toggleSymbol,
    addWatchItem,
    removeWatchItem,
  } = useSettings();

  const watchParam = settings.watchlist.map((w) => w.symbol).join(",");
  const apiUrl = watchParam ? `/api/market?watch=${encodeURIComponent(watchParam)}` : "/api/market";

  const { data, error, isLoading } = useSWR<MarketData>(loaded ? apiUrl : null, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString("ko-KR")
    : null;

  const vixItem = data?.fear?.[0];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 bg-[#0a0e1a]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            M
          </div>
          <span className="font-bold text-base">MacroView</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isLoading && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                업데이트 중
              </span>
            )}
            {error && <span className="text-red-400">데이터 오류</span>}
            {updatedAt && !isLoading && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {updatedAt} 기준
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-white transition-colors text-lg"
            title="표시 항목 설정"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {isVisible("indices") && (
          <section>
            <SectionTitle icon="📊" title="주가지수" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(data?.indices ?? Array(5).fill(null))
                .filter((item) => !item || isSymbolVisible(item.symbol))
                .map((item, i) =>
                  item ? (
                    <MarketCard key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                  ) : (
                    <SkeletonCard key={i} />
                  )
                )}
            </div>
          </section>
        )}

        {(isVisible("bonds") || isVisible("forex") || isVisible("fear")) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {isVisible("bonds") && (() => {
              const visibleBonds = (data?.bonds ?? Array(4).fill(null)).filter(
                (item) => !item || isSymbolVisible(item.symbol)
              );
              return (
                <section className="lg:col-span-1">
                  <SectionTitle icon="🏦" title="미국 국채 수익률" />
                  <div className="grid grid-cols-2 gap-3">
                    {visibleBonds.map((item, i) =>
                      item ? (
                        <MarketCard key={item.symbol} {...item} decimals={3} onClick={() => setSelected(item)} />
                      ) : (
                        <SkeletonCard key={i} />
                      )
                    )}
                  </div>
                  {data?.bonds && visibleBonds.length > 1 && (
                    <YieldCurve
                      bonds={visibleBonds
                        .filter((b): b is MarketItem => !!b)
                        .map((b) => ({
                          maturity: b.maturity ?? "",
                          price: b.price,
                          changePercent: b.changePercent,
                        }))}
                    />
                  )}
                </section>
              );
            })()}

            {isVisible("forex") && (
              <section className="lg:col-span-1">
                <SectionTitle icon="💱" title="환율" />
                <div className="grid grid-cols-2 gap-3">
                  {(data?.forex ?? Array(4).fill(null))
                    .filter((item) => !item || isSymbolVisible(item.symbol))
                    .map((item, i) =>
                      item ? (
                        <MarketCard key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                      ) : (
                        <SkeletonCard key={i} />
                      )
                    )}
                </div>
              </section>
            )}

            {isVisible("fear") && (
              <section>
                <SectionTitle icon="😨" title="시장 심리" />
                <div
                  className="rounded-xl border border-white/10 p-4 bg-white/5 flex flex-col items-center cursor-pointer hover:border-white/25 transition-all"
                  onClick={() => vixItem && setSelected(vixItem)}
                >
                  <div className="text-xs text-gray-400 mb-3 font-medium">VIX 공포지수</div>
                  <FearGauge
                    vix={vixItem?.price ?? null}
                    changePercent={vixItem?.changePercent ?? null}
                  />
                </div>
              </section>
            )}
          </div>
        )}

        {(isVisible("commodities") || isVisible("calendar")) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isVisible("commodities") && (
              <section>
                <SectionTitle icon="🛢️" title="원자재" />
                <div className="grid grid-cols-2 gap-3">
                  {(data?.commodities ?? Array(4).fill(null))
                    .filter((item) => !item || isSymbolVisible(item.symbol))
                    .map((item, i) =>
                      item ? (
                        <MarketCard key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                      ) : (
                        <SkeletonCard key={i} />
                      )
                    )}
                </div>
              </section>
            )}

            {isVisible("calendar") && (
              <section>
                <SectionTitle icon="📅" title="경제 캘린더" />
                <div className="rounded-xl border border-white/10 p-4 bg-white/5">
                  <EconCalendar />
                </div>
              </section>
            )}
          </div>
        )}

        {isVisible("watchlist") && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle icon="⭐" title="관심종목" />
              <button
                onClick={() => setShowAddStock(true)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mb-3"
              >
                + 종목 추가
              </button>
            </div>
            {settings.watchlist.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
                관심있는 종목을 추가해보세요 (예: AAPL, TSLA, 005930.KS)
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(data?.watchlist ?? settings.watchlist.map((w) => ({ ...w, price: null, change: null, changePercent: null }))).map((item) => (
                  <div key={item.symbol} className="relative group">
                    <MarketCard {...item} decimals={2} onClick={() => setSelected(item)} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWatchItem(item.symbol);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-700 text-gray-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="text-center text-xs text-gray-600 py-6 mt-4">
        데이터 출처: Yahoo Finance · 15분 지연 데이터 포함 · 투자 참고용
      </footer>

      {selected && (
        <ChartModal
          symbol={selected.symbol}
          name={selected.name}
          price={selected.price}
          changePercent={selected.changePercent}
          onClose={() => setSelected(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          hiddenSections={settings.hiddenSections}
          hiddenSymbols={settings.hiddenSymbols}
          onToggleSection={toggleSection}
          onToggleSymbol={toggleSymbol}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAddStock && (
        <AddStockModal
          onAdd={addWatchItem}
          onClose={() => setShowAddStock(false)}
        />
      )}
    </div>
  );
}
