import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { MonthlyPeriodChart } from "./Charts.jsx";
import { Calendar } from "./Calendar.jsx";
import { PrevCycles } from "./PrevCycles.jsx";
import { Logs } from "./Logs.jsx";
import { Reminders } from "./Reminders.jsx";
import { AIAssistant } from "./AIAssistant.jsx";

// Dashboard main component
export function Dashboard({ user, token, onLogout }) {
  const [view, setView] = useState("overview");
  const [prediction, setPrediction] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [logsCount, setLogsCount] = useState(0);
  const [adding, setAdding] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const refreshData = () => {
    if (!token) return;

    fetch(`/api/cycles/prediction`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((p) => setPrediction(p))
      .catch(() => setPrediction(null));

    fetch(`/api/cycles`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((c) => setCycles(c || []))
      .catch(() => setCycles([]));

    fetch(`/api/logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((l) => setLogsCount(l.length || 0))
      .catch(() => setLogsCount(0));
  };

  useEffect(() => {
    refreshData();
  }, [token]);

  const handleAddCycle = async (e) => {
    e?.preventDefault();
    if (!startDate) {
      setMessage("Start date is required");
      return;
    }
    setAdding(true);
    setMessage("");
    try {
      const body = { startDate };
      if (endDate) body.endDate = endDate;
      const res = await fetch(`/api/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add cycle");
      await res.json();
      setStartDate("");
      setEndDate("");
      setMessage("Cycle added");
      refreshData();
      setView("overview");
    } catch (err) {
      setMessage(err.message || "Error");
    } finally {
      setAdding(false);
    }
  };

  // Build a phases map for calendar highlighting (period/fertile/ovulation)
  const buildPhases = () => {
    const map = {};
    // use prediction if available
    if (prediction) {
      if (prediction.nextPeriodStart && prediction.periodLength) {
        const pstart = new Date(prediction.nextPeriodStart);
        const pend = new Date(pstart);
        pend.setDate(pend.getDate() + (prediction.periodLength || 5) - 1);
        for (let d = new Date(pstart); d <= pend; d.setDate(d.getDate() + 1)) {
          map[new Date(d).toISOString().slice(0, 10)] = "period";
        }
      }
      if (prediction.fertileStart && prediction.fertileEnd) {
        for (let d = new Date(prediction.fertileStart); d <= new Date(prediction.fertileEnd); d.setDate(d.getDate() + 1)) {
          map[new Date(d).toISOString().slice(0, 10)] = "fertile";
        }
      }
      if (prediction.ovulationDate) {
        map[new Date(prediction.ovulationDate).toISOString().slice(0, 10)] = "ovulation";
      }
    }

    // fallback: mark last period if cycles exist
    if (cycles && cycles.length > 0) {
      const last = cycles[0];
      const s = new Date(last.startDate);
      const e = last.endDate ? new Date(last.endDate) : new Date(s);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        map[new Date(d).toISOString().slice(0, 10)] = map[new Date(d).toISOString().slice(0, 10)] || "period";
      }
    }

    return map;
  };

  const phases = buildPhases();

  // Compute monthly period-days for the past N months (default 6)
  const [monthsRange, setMonthsRange] = useState(6);
  const computeMonthlyPeriodDays = (cycles, monthsBack = 6) => {
    const now = new Date();
    const countsMap = new Map();
    // initialize last `monthsBack` months
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      countsMap.set(key, 0);
    }

    (cycles || []).forEach((c) => {
      const s = new Date(c.startDate);
      const e = c.endDate ? new Date(c.endDate) : new Date(s);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (countsMap.has(key)) countsMap.set(key, countsMap.get(key) + 1);
      }
    });

    const labels = [];
    const counts = [];
    Array.from(countsMap.keys()).forEach((k) => {
      const [y, m] = k.split("-");
      const d = new Date(parseInt(y), parseInt(m), 1);
      labels.push(d.toLocaleDateString(undefined, { month: "short" }));
      counts.push(countsMap.get(k));
    });

    return { labels, counts };
  };

  const monthly = computeMonthlyPeriodDays(cycles, monthsRange);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3">
        <Sidebar view={view} setView={setView} onLogout={onLogout} user={user} />
      </div>

      <div className="col-span-9 space-y-6">
        {/* Overview / header */}
        {view === "overview" && (
          <section className="space-y-6">
            {/* Next Cycle Card */}
            <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 p-6 shadow-lg ring-1 ring-pink-100">
              <h3 className="text-lg font-semibold text-neutral-800">Next cycle prediction</h3>
              {prediction && prediction.nextPeriodStart ? (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-neutral-500">Predicted start</div>
                    <div className="mt-1 text-2xl font-bold text-pink-600">{new Date(prediction.nextPeriodStart).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Period length</div>
                    <div className="mt-1 text-2xl font-bold text-rose-600">{prediction.periodLength || 5} days</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Cycle length</div>
                    <div className="mt-1 text-2xl font-bold text-purple-600">{prediction.cycleLength || 28} days</div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-neutral-600">Add cycles to get predictions</div>
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="col-span-2">
                <div className="rounded-2xl bg-white p-4 shadow">
                  <h4 className="font-medium">Calendar</h4>
                  <div className="mt-3">
                    <Calendar year={new Date().getFullYear()} month={new Date().getMonth()} phases={phases} />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-gradient-to-br from-white to-pink-50 p-4 shadow-lg ring-1 ring-pink-100">
                <h4 className="font-medium">Summary</h4>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="p-3 rounded-lg bg-pink-100/60 ring-1 ring-pink-50">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.686 2 6 4.686 6 8c0 5 6 12 6 12s6-7 6-12c0-3.314-2.686-6-6-6z" fill="#f43f5e" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-400">Tracked cycles</div>
                      <div className="text-2xl font-bold text-neutral-900">{cycles.length}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-400">Logged days</div>
                      <div className="text-2xl font-bold text-neutral-900">{logsCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neutral-400">Avg cycle</div>
                      <div className="text-xl font-semibold text-pink-600">{prediction?.cycleLength || 28} days</div>
                    </div>

                    <div>
                      <button onClick={() => setView("logs")} className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">View logs</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Period-days per month chart (replaces cycle length trend) */}
            {cycles.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow">
                <h4 className="font-medium">Period days per month (last {monthsRange} months)</h4>
                <div className="mt-4">
                  <MonthlyPeriodChart labels={monthly.labels} data={monthly.counts} width={720} height={160} />
                </div>
              </div>
            )}
          </section>
        )}

        {view === "calendar" && (
          <div className="rounded-xl bg-white p-6 shadow">
            <Calendar year={new Date().getFullYear()} month={new Date().getMonth()} phases={phases} />
          </div>
        )}

        {view === "add-cycle" && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="font-medium">Add a new cycle</h3>
            <p className="mt-2 text-sm text-neutral-500">Enter the start date of your period. End date is optional (defaults to +5 days).</p>
            <form onSubmit={handleAddCycle} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Start date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2" />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-600">End date (optional)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2" />
                <p className="mt-1 text-xs text-neutral-400">Leave empty to auto-calculate as start date + 5 days</p>
              </div>

              <div className="flex items-center gap-3">
                <button disabled={adding} className="rounded-full bg-pink-500 px-6 py-2 text-white hover:bg-pink-600 disabled:opacity-70">{adding ? "Adding…" : "Add cycle"}</button>
                <button type="button" onClick={() => { setStartDate(""); setEndDate(""); setMessage(""); setView("overview"); }} className="rounded-full border border-neutral-200 px-6 py-2 hover:bg-neutral-50">Cancel</button>
              </div>

              {message && <div className={`text-sm ${message.includes("added") ? "text-emerald-600" : "text-rose-600"}`}>{message}</div>}
            </form>
          </div>
        )}

        {view === "cycles" && <PrevCycles token={token} />}

        {view === "logs" && <Logs token={token} />}

        {view === "reminders" && <Reminders token={token} />}

        {view === "assistant" && <div className="rounded-xl bg-white p-4 shadow"><p className="text-sm">Open the AI assistant using the floating button.</p></div>}

        {/* Always render assistant floating button */}
        <AIAssistant token={token} />
      </div>
    </div>
  );
}
