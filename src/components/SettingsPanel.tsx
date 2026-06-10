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
        on ? "bg-blue-500" : "bg-gray-700"
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">표시할 항목 선택</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-2 overflow-y-auto">
          {SECTION_KEYS.map((key) => {
            const visible = !hiddenSections.includes(key);
            const items = SECTION_ITEMS[key];
            const isExpanded = expanded === key;

            return (
              <div key={key}>
                <div className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 transition-colors">
                  <button
                    onClick={() => onToggleSection(key)}
                    className="flex-1 text-left flex items-center gap-2"
                  >
                    <span className={`text-sm ${visible ? "text-white" : "text-gray-500"}`}>
                      {SECTION_LABELS[key]}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    {items && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : key)}
                        className="text-gray-500 hover:text-gray-300 text-xs px-1"
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
                  <div className="ml-4 mb-1 border-l border-white/10 pl-3">
                    {items.map((item) => {
                      const itemVisible = !hiddenSymbols.includes(item.symbol);
                      return (
                        <button
                          key={item.symbol}
                          onClick={() => onToggleSymbol(item.symbol)}
                          disabled={!visible}
                          className={`w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors ${
                            !visible ? "opacity-40" : ""
                          }`}
                        >
                          <span className={`text-xs ${itemVisible ? "text-gray-300" : "text-gray-600"}`}>
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
        <div className="p-3 border-t border-white/10 text-xs text-gray-500 text-center">
          설정은 이 브라우저에 자동 저장됩니다
        </div>
      </div>
    </div>
  );
}
