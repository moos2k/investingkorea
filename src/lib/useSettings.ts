"use client";

import { useEffect, useState, useCallback } from "react";

export const SECTION_KEYS = ["indices", "bonds", "forex", "fear", "commodities", "calendar", "watchlist"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  indices: "📊 주가지수",
  bonds: "🏦 미국 국채 수익률",
  forex: "💱 환율",
  fear: "😨 시장 심리 (VIX)",
  commodities: "🛢️ 원자재",
  calendar: "📅 경제 캘린더",
  watchlist: "⭐ 관심종목",
};

export interface WatchItem {
  symbol: string;
  name: string;
}

interface Settings {
  hiddenSections: SectionKey[];
  hiddenSymbols: string[]; // 개별 항목(심볼) 단위 숨김
  watchlist: WatchItem[];
}

const DEFAULT_SETTINGS: Settings = {
  hiddenSections: [],
  hiddenSymbols: [],
  watchlist: [],
};

const STORAGE_KEY = "macroview-settings-v1";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = useCallback((key: SectionKey) => {
    setSettings((prev) => {
      const isHidden = prev.hiddenSections.includes(key);
      const next = {
        ...prev,
        hiddenSections: isHidden
          ? prev.hiddenSections.filter((k) => k !== key)
          : [...prev.hiddenSections, key],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const addWatchItem = useCallback((item: WatchItem) => {
    setSettings((prev) => {
      if (prev.watchlist.some((w) => w.symbol === item.symbol)) return prev;
      const next = { ...prev, watchlist: [...prev.watchlist, item] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removeWatchItem = useCallback((symbol: string) => {
    setSettings((prev) => {
      const next = { ...prev, watchlist: prev.watchlist.filter((w) => w.symbol !== symbol) };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleSymbol = useCallback((symbol: string) => {
    setSettings((prev) => {
      const isHidden = prev.hiddenSymbols.includes(symbol);
      const next = {
        ...prev,
        hiddenSymbols: isHidden
          ? prev.hiddenSymbols.filter((s) => s !== symbol)
          : [...prev.hiddenSymbols, symbol],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isVisible = useCallback(
    (key: SectionKey) => !settings.hiddenSections.includes(key),
    [settings.hiddenSections]
  );

  const isSymbolVisible = useCallback(
    (symbol: string) => !settings.hiddenSymbols.includes(symbol),
    [settings.hiddenSymbols]
  );

  return {
    settings,
    loaded,
    isVisible,
    isSymbolVisible,
    toggleSection,
    toggleSymbol,
    addWatchItem,
    removeWatchItem,
    persist,
  };
}
