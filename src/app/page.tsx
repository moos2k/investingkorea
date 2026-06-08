"use client";

import { useState } from "react";
import useSWR from "swr";
import MarketCard from "@/components/MarketCard";
import YieldCurve from "@/components/YieldCurve";
import FearGauge from "@/components/FearGauge";
import EconCalendar from "@/components/EconCalendar";
import ChartModal from "@/components/ChartModal";

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

  const { data, error, isLoading } = useSWR<MarketData>("/api/market", fetcher, {
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <section>
          <SectionTitle icon="📊" title="주가지수" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(data?.indices ?? Array(5).fill(null)).map((item, i) =>
              item ? (
                <MarketCard key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
              ) : (
                <SkeletonCard key={i} />
              )
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1">
            <SectionTitle icon="🏦" title="미국 국채 수익률" />
            <div className="grid grid-cols-2 gap-3">
              {(data?.bonds ?? Array(4).fill(null)).map((item, i) =>
                item ? (
                  <MarketCard key={item.symbol} {...item} decimals={3} onClick={() => setSelected(item)} />
                ) : (
                  <SkeletonCard key={i} />
                )
              )}
            </div>
            {data?.bonds && (
              <YieldCurve
                bonds={data.bonds.map((b) => ({
                  maturity: b.maturity ?? "",
                  price: b.price,
                  changePercent: b.changePercent,
                }))}
              />
            )}
          </section>

          <section className="lg:col-span-1">
            <SectionTitle icon="💱" title="환율" />
            <div className="grid grid-cols-2 gap-3">
              {(data?.forex ?? Array(4).fill(null)).map((item, i) =>
                item ? (
                  <MarketCard key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                ) : (
                  <SkeletonCard key={i} />
                )
              )}
            </div>
          </section>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <SectionTitle icon="🛢️" title="원자재" />
            <div className="grid grid-cols-2 gap-3">
              {(data?.commodities ?? Array(4).fill(null)).map((item, i) =>
                item ? (
                  <MarketCard key={item.symbol} {...item} decimals={2} onClick={() => setSelected(item)} />
                ) : (
                  <SkeletonCard key={i} />
                )
              )}
            </div>
          </section>

          <section>
            <SectionTitle icon="📅" title="경제 캘린더" />
            <div className="rounded-xl border border-white/10 p-4 bg-white/5">
              <EconCalendar />
            </div>
          </section>
        </div>
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
    </div>
  );
}
