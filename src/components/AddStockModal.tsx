"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { WatchItem } from "@/lib/useSettings";

interface SearchResult {
  symbol: string;
  name: string;
  type?: string;
  exchange?: string;
}

interface AddStockModalProps {
  onAdd: (item: WatchItem) => void;
  onClose: () => void;
}

export default function AddStockModal({ onAdd, onClose }: AddStockModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">종목 추가</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="티커 또는 회사명 입력 (예: AAPL, Tesla, 005930.KS)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50"
          />
          <div className="text-xs text-gray-500 mt-2">
            💡 한국 종목은 <span className="text-gray-300">005930.KS</span>(코스피) / <span className="text-gray-300">.KQ</span>(코스닥) 형식으로 검색하세요.
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && <div className="p-4 text-sm text-gray-500 text-center">검색 중...</div>}
          {!loading && query && results.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center">검색 결과가 없습니다</div>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={r.symbol}
                onClick={() => {
                  onAdd({ symbol: r.symbol, name: r.name });
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <div>
                  <div className="text-sm text-white font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.symbol} {r.exchange ? `· ${r.exchange}` : ""}</div>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 rounded px-2 py-0.5">{r.type}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
