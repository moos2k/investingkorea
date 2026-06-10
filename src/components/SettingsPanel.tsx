"use client";

import { useEffect } from "react";
import { SECTION_KEYS, SECTION_LABELS, type SectionKey } from "@/lib/useSettings";

interface SettingsPanelProps {
  hiddenSections: SectionKey[];
  onToggle: (key: SectionKey) => void;
  onClose: () => void;
}

export default function SettingsPanel({ hiddenSections, onToggle, onClose }: SettingsPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">표시할 항목 선택</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-2">
          {SECTION_KEYS.map((key) => {
            const visible = !hiddenSections.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className={`text-sm ${visible ? "text-white" : "text-gray-500"}`}>
                  {SECTION_LABELS[key]}
                </span>
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    visible ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      visible ? "translate-x-4.5" : "translate-x-1"
                    }`}
                    style={{ transform: visible ? "translateX(18px)" : "translateX(2px)" }}
                  />
                </span>
              </button>
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
