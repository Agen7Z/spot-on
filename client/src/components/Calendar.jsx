import React, { useMemo, useState } from "react";

// Enhanced calendar with month navigation, legend, today highlight, and phase markers.
export function Calendar({ year: pYear, month: pMonth, phases = {} }) {
  const today = new Date();
  const [year, setYear] = useState(pYear || today.getFullYear());
  const [month, setMonth] = useState(typeof pMonth === "number" ? pMonth : today.getMonth());

  // compute month matrix
  const matrix = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const rows = [];
    let cells = [];

    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
    while (cells.length) rows.push(cells.splice(0, 7));
    return rows;
  }, [year, month]);

  const prevMonth = () => {
    const m = month - 1;
    if (m < 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth(m);
  };

  const nextMonth = () => {
    const m = month + 1;
    if (m > 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth(m);
  };

  const phaseFor = (d) => {
    if (!d) return null;
    const iso = d.toISOString().slice(0, 10);
    return phases[iso];
  };

  const monthLabel = new Date(year, month).toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl bg-gradient-to-b from-white to-rose-50 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-neutral-500">Calendar</div>
          <div className="text-lg font-semibold">{monthLabel}</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-md px-3 py-2 hover:bg-rose-50">◀</button>
          <button onClick={nextMonth} className="rounded-md px-3 py-2 hover:bg-rose-50">▶</button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-xs text-neutral-500">
        <div className="text-center">Sun</div>
        <div className="text-center">Mon</div>
        <div className="text-center">Tue</div>
        <div className="text-center">Wed</div>
        <div className="text-center">Thu</div>
        <div className="text-center">Fri</div>
        <div className="text-center">Sat</div>
      </div>

      <div className="mt-2 space-y-1">
        {matrix.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-1 text-sm">
            {row.map((d, ci) => {
              const p = phaseFor(d);
              const isToday = d && d.toDateString() === today.toDateString();
              return (
                <div key={ci} className={`h-14 rounded-lg p-2 ${isToday ? "ring-2 ring-pink-200" : ""} bg-white/60`}>
                  {d ? (
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="text-xs text-neutral-600">{d.getDate()}</div>
                        {p && (
                          <div className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                            p === "period" ? "bg-rose-200 text-rose-700" : p === "fertile" ? "bg-yellow-200 text-yellow-800" : p === "ovulation" ? "bg-emerald-200 text-emerald-800" : "bg-rose-50 text-rose-700"
                          }`} title={p}>
                            {p}
                          </div>
                        )}
                      </div>

                      <div className="self-end text-[11px] text-neutral-400">&nbsp;</div>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-200" />
          <div>Period</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-200" />
          <div>Fertile</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-200" />
          <div>Ovulation</div>
        </div>
      </div>
    </div>
  );
}
