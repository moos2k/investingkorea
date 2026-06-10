"use client";

// Static upcoming economic events (refresh manually or connect to an API)
const EVENTS = [
  { date: "2026-06-11", time: "21:30", name: "CPI (미국 소비자물가)", importance: 3 },
  { date: "2026-06-11", time: "21:30", name: "Core CPI", importance: 3 },
  { date: "2026-06-18", time: "03:00", name: "FOMC 금리결정", importance: 3 },
  { date: "2026-06-18", time: "03:30", name: "파월 의장 기자회견", importance: 3 },
  { date: "2026-06-27", time: "21:30", name: "PCE 물가지수", importance: 2 },
  { date: "2026-07-02", time: "21:30", name: "비농업 고용지수 (NFP)", importance: 3 },
];

export default function EconCalendar() {
  const today = new Date();
  const upcoming = EVENTS.filter((e) => new Date(e.date) >= today).slice(0, 5);

  return (
    <div className="space-y-2">
      {upcoming.map((e, i) => {
        const d = new Date(e.date);
        const daysLeft = Math.ceil((d.getTime() - today.getTime()) / 86400000);
        return (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
            <div className="text-center min-w-[48px]">
              <div className="text-xs text-gray-400">
                {d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs font-bold text-amber-500">{e.time}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900">{e.name}</div>
              <div className="text-xs text-gray-400">
                {daysLeft === 0 ? "오늘" : daysLeft === 1 ? "내일" : `${daysLeft}일 후`}
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-1.5 h-3 rounded-sm ${
                    n <= e.importance ? "bg-amber-400" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
