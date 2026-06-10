"use client";

import { useState, type ReactNode } from "react";
import useSWR from "swr";
import MarketListItem from "@/components/MarketListItem";
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
  delay?: number;
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
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function ListContainer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
      {children}
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center justify-between px-4 py-3 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-24" />
      <div className="h-3 bg-gray-200 rounded w-16" />
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
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
            {error && <span className="text-rose-500">데이터 오류</span>}
            {updatedAt && !isLoading && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {updatedAt} 기준
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-gray-700 transition-colors text-lg"
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
            <ListContainer>
              {(data?.indices ?? Array(5).fill(null))
                .filter((item) => !item || isSymbolVisible(item.symbol))
                .map((item, i) =>
                  item ? (
                    <MarketListItem key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                  ) : (
                    <SkeletonListItem key={i} />
                  )
                )}
            </ListContainer>
          </section>
        )}

        {(isVisible("bonds") || isVisible("forex") || isVisible("fear")) && (() => {
          const visibleBonds = isVisible("bonds")
            ? (data?.bonds ?? Array(4).fill(null)).filter((item) => !item || isSymbolVisible(item.symbol))
            : [];
          const visibleForex = isVisible("forex")
            ? (data?.forex ?? Array(4).fill(null)).filter((item) => !item || isSymbolVisible(item.symbol))
            : [];
          const validBonds = visibleBonds.filter((b): b is MarketItem => !!b);

          return (
            <section>
              <SectionTitle icon="🏦" title="국채 · 환율 · 시장심리" />
              <ListContainer>
                {visibleBonds.map((item, i) =>
                  item ? (
                    <MarketListItem key={item.symbol} {...item} decimals={3} onClick={() => setSelected(item)} />
                  ) : (
                    <SkeletonListItem key={`bond-${i}`} />
                  )
                )}
                {visibleForex.map((item, i) =>
                  item ? (
                    <MarketListItem key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                  ) : (
                    <SkeletonListItem key={`fx-${i}`} />
                  )
                )}
                {isVisible("fear") && (
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => vixItem && setSelected(vixItem)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 truncate">VIX 공포지수</span>
                      {!!vixItem?.delay && (
                        <span className="bg-amber-100 text-amber-700 rounded px-1 text-[10px] font-normal flex-shrink-0">
                          {vixItem.delay}분 지연
                        </span>
                      )}
                    </div>
                    <FearGauge
                      vix={vixItem?.price ?? null}
                      changePercent={vixItem?.changePercent ?? null}
                      layout="row"
                    />
                  </div>
                )}
              </ListContainer>
              {data?.bonds && validBonds.length > 1 && (
                <YieldCurve
                  bonds={validBonds.map((b) => ({
                    maturity: b.maturity ?? "",
                    price: b.price,
                    changePercent: b.changePercent,
                  }))}
                />
              )}
            </section>
          );
        })()}

        {(isVisible("commodities") || isVisible("calendar")) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isVisible("commodities") && (
              <section>
                <SectionTitle icon="🛢️" title="원자재" />
                <ListContainer>
                  {(data?.commodities ?? Array(4).fill(null))
                    .filter((item) => !item || isSymbolVisible(item.symbol))
                    .map((item, i) =>
                      item ? (
                        <MarketListItem key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                      ) : (
                        <SkeletonListItem key={i} />
                      )
                    )}
                </ListContainer>
              </section>
            )}

            {isVisible("calendar") && (
              <section>
                <SectionTitle icon="📅" title="경제 캘린더" />
                <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
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
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 mb-3"
              >
                + 종목 추가
              </button>
            </div>
            {settings.watchlist.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
                관심있는 종목을 추가해보세요 (예: AAPL, TSLA, 005930.KS)
              </div>
            ) : (
              <ListContainer>
                {(data?.watchlist ?? settings.watchlist.map((w) => ({ ...w, price: null, change: null, changePercent: null }))).map((item) => (
                  <MarketListItem
                    key={item.symbol}
                    {...item}
                    decimals={2}
                    onClick={() => setSelected(item)}
                    onRemove={() => removeWatchItem(item.symbol)}
                  />
                ))}
              </ListContainer>
            )}
          </section>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 mt-4">
        데이터 출처: Yahoo Finance · 일부 항목은 지연 데이터 포함 · 투자 참고용
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
