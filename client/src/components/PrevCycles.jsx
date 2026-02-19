import React, { useEffect, useState } from "react";

export function PrevCycles({ token }) {
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/cycles`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setCycles)
      .catch(() => setCycles([]));
  }, [token]);

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h4 className="mb-3 font-medium">Previous cycles</h4>
      <ul className="space-y-2 text-sm text-neutral-700">
        {cycles.length === 0 && <li className="text-neutral-400">No cycles yet</li>}
        {cycles.map((c) => (
          <li key={c._id} className="flex justify-between">
            <div>
              <div className="font-medium">{new Date(c.startDate).toDateString()}</div>
              <div className="text-xs text-neutral-500">Length: {c.cycleLength || "—"} days</div>
            </div>
            <div className="text-xs text-neutral-500">{c.endDate ? new Date(c.endDate).toDateString() : "Ongoing"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
