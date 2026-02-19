import React, { useEffect, useState } from "react";

export function Logs({ token }) {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symptoms, setSymptoms] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setLogs);
  }, [token]);

  const save = async (e) => {
    e.preventDefault();
    const payload = { date, symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean) };
    try {
      const res = await fetch(`/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLogs((prev) => [data, ...prev.filter((l) => l.date !== data.date)]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h4 className="mb-3 font-medium">Daily logs</h4>
      <form onSubmit={save} className="mb-3 flex flex-col gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border px-3 py-2" />
        <input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Symptoms (comma separated) e.g. cramps, headache" className="rounded-md border px-3 py-2" />
        <div className="flex gap-2">
          <button className="rounded-full bg-pink-500 px-4 py-2 text-white">Save</button>
        </div>
      </form>

      <div className="space-y-2 text-sm">
        {logs.length === 0 && <div className="text-neutral-400">No logs yet</div>}
        {logs.map((l) => (
          <div key={l._id || l.date} className="rounded-md border p-3">
            <div className="text-xs text-neutral-500">{new Date(l.date).toDateString()}</div>
            <div className="mt-1 text-sm">Symptoms: {l.symptoms?.join(", ") || "—"}</div>
            {l.notes && <div className="mt-1 text-xs text-neutral-500">{l.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
