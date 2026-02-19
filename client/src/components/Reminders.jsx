import React, { useEffect, useState } from "react";

export function Reminders({ token }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/reminders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.length === 0) {
          // default reminders for new users
          setReminders([
            { type: "period", daysBefore: 2, timeOfDay: "20:00", method: "email", enabled: true },
            { type: "ovulation", daysBefore: 2, timeOfDay: "08:00", method: "email", enabled: false }
          ]);
        } else {
          setReminders(data);
        }
      })
      .catch(() => setReminders([]));
  }, [token]);

  const updateLocal = (idx, patch) => {
    setReminders((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    setLoading(true);
    try {
      await fetch(`/api/reminders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reminders }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h4 className="mb-1 font-medium">Reminders</h4>
        <button onClick={save} disabled={loading} className="rounded-full bg-pink-500 px-3 py-1 text-sm text-white hover:bg-pink-600 disabled:opacity-60">
          {loading ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {reminders.length === 0 && <div className="text-neutral-400">No reminders configured</div>}

        {reminders.map((r, i) => (
          <div key={i} className="rounded-lg border border-neutral-100 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold capitalize">{r.type} reminder</div>
                <div className="text-xs text-neutral-500">Notify by email before the event</div>
              </div>
              <div>
                <label className={`inline-flex items-center gap-2 text-sm ${r.enabled ? "text-emerald-600" : "text-neutral-400"}`}>
                  <input type="checkbox" checked={!!r.enabled} onChange={(e) => updateLocal(i, { enabled: e.target.checked })} />
                  {r.enabled ? "Enabled" : "Disabled"}
                </label>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-neutral-500">Days before</label>
                <input type="number" min={0} value={r.daysBefore ?? 0} onChange={(e) => updateLocal(i, { daysBefore: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-neutral-200 px-2 py-1" />
              </div>

              <div>
                <label className="text-xs text-neutral-500">Time of day</label>
                <input type="time" value={r.timeOfDay || "20:00"} onChange={(e) => updateLocal(i, { timeOfDay: e.target.value })} className="mt-1 w-full rounded-md border border-neutral-200 px-2 py-1" />
              </div>

              <div>
                <label className="text-xs text-neutral-500">Method</label>
                <select value={r.method || "email"} onChange={(e) => updateLocal(i, { method: e.target.value })} className="mt-1 w-full rounded-md border border-neutral-200 px-2 py-1 text-sm">
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
