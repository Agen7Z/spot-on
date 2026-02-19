import React, { useEffect, useState } from "react";

export function Logs({ token }) {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symptoms, setSymptoms] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setLogs);
  }, [token]);

  const deleteLog = async (id) => {
    if (!confirm("Delete this log?")) return;
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (log) => {
    setEditingId(log._id);
    setDate(new Date(log.date).toISOString().slice(0, 10));
    setSymptoms((log.symptoms || []).join(", "));
    setMood(log.mood || "");
    setNotes(log.notes || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setSymptoms("");
    setMood("");
    setNotes("");
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { date, symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean), mood, notes };
    try {
      if (editingId) {
        const res = await fetch(`/api/logs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setLogs((prev) => prev.map((l) => (l._id === data._id ? data : l)));
          cancelEdit();
        }
      } else {
        const res = await fetch(`/api/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setLogs((prev) => [data, ...prev.filter((l) => l.date !== data.date)]);
      }
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
        <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Mood (optional)" className="rounded-md border px-3 py-2" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="rounded-md border px-3 py-2" />
        <div className="flex gap-2">
          <button className="rounded-full bg-pink-500 px-4 py-2 text-white">{editingId ? "Update" : "Save"}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded-full border px-4 py-2">Cancel</button>
          )}
        </div>
      </form>

      <div className="space-y-2 text-sm">
        {logs.length === 0 && <div className="text-neutral-400">No logs yet</div>}
        {logs.map((l) => (
          <div key={l._id || l.date} className="rounded-md border p-3 relative">
            <div className="text-xs text-neutral-500">{new Date(l.date).toDateString()}</div>
            <div className="mt-1 text-sm">Symptoms: {l.symptoms?.join(", ") || "—"}</div>
            {l.mood && <div className="mt-1 text-sm">Mood: {l.mood}</div>}
            {l.notes && <div className="mt-1 text-xs text-neutral-500">{l.notes}</div>}
            <div className="absolute top-2 right-2 flex gap-2">
              {l._id && (
                <>
                  <button onClick={() => startEdit(l)} className="text-xs text-blue-500">Edit</button>
                  <button onClick={() => deleteLog(l._id)} className="text-xs text-red-500">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
