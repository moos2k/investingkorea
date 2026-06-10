"use client";

import { useEffect, useState } from "react";
import { SECTION_KEYS, SECTION_LABELS, type SectionKey } from "@/lib/useSettings";
import { MARKET_SYMBOLS } from "@/lib/marketSymbols";

interface SettingsPanelProps {
  hiddenSections: SectionKey[];
  hiddenSymbols: string[];
  onToggleSection: (key: SectionKey) => void;
  onToggleSymbol: (symbol: string) => void;
  onClose: () => void;
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
      />
    </span>
  );
}

// 섹션별 하위 항목 (펼침 가능 여부 판단용)
const SECTION_ITEMS: Partial<Record<SectionKey, { symbol: string; name: string }[]>> = {
  indices: MARKET_SYMBOLS.indices.map((x) => ({ symbol: x.symbol, name: x.name })),
  bonds: MARKET_SYMBOLS.bonds.map((x) => ({ symbol: x.symbol, name: `${x.name} (${x.maturity})` })),
  forex: MARKET_SYMBOLS.forex.map((x) => ({ symbol: x.symbol, name: x.name })),
  commodities: MARKET_SYMBOLS.commodities.map((x) => ({ symbol: x.symbol, name: x.name })),
};

export default function SettingsPanel({
  hiddenSections,
  hiddenSymbols,
  onToggleSection,
  onToggleSymbol,
  onClose,
}: SettingsPanelProps) {
  const [expanded, setExpanded] = useState<SectionKey | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">표시할 항목 선택</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>
        <div className="p-2 overflow-y-auto">
          {SECTION_KEYS.map((key) => {
            const visible = !hiddenSections.includes(key);
            const items = SECTION_ITEMS[key];
            const isExpanded = expanded === key;

            return (
              <div key={key}>
                <div className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => onToggleSection(key)}
                    className="flex-1 text-left flex items-center gap-2"
                  >
                    <span className={`text-sm ${visible ? "text-gray-900" : "text-gray-400"}`}>
                      {SECTION_LABELS[key]}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    {items && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : key)}
                        className="text-gray-400 hover:text-gray-600 text-xs px-1"
                        title="세부 항목"
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    )}
                    <button onClick={() => onToggleSection(key)}>
                      <Toggle on={visible} />
                    </button>
                  </div>
                </div>

                {isExpanded && items && (
                  <div className="ml-4 mb-1 border-l border-gray-200 pl-3">
                    {items.map((item) => {
                      const itemVisible = !hiddenSymbols.includes(item.symbol);
                      return (
                        <button
                          key={item.symbol}
                          onClick={() => onToggleSymbol(item.symbol)}
                          disabled={!visible}
                          className={`w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                            !visible ? "opacity-40" : ""
                          }`}
                        >
                          <span className={`text-xs ${itemVisible ? "text-gray-600" : "text-gray-400"}`}>
                            {item.name}
                          </span>
                          <Toggle on={itemVisible} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-gray-200 text-xs text-gray-400 text-center">
          설정은 이 브라우저에 자동 저장됩니다
        </div>
      </div>
    </div>
  );
}
