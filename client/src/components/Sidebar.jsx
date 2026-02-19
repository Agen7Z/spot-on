import React from "react";

export function Sidebar({ view, setView, onLogout, user }) {
  const items = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "add-cycle", label: "Add cycle", icon: "➕" },
    { key: "logs", label: "Logs", icon: "📝" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "cycles", label: "Previous cycles", icon: "📚" },
    { key: "reminders", label: "Reminders", icon: "🔔" }
  ];

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-20 rounded-xl bg-gradient-to-b from-white/60 to-rose-50/30 p-4 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">{(user && user.username ? user.username.charAt(0).toUpperCase() : 'S')}</div>
          <div>
            <div className="text-sm font-semibold">{(user && user.username) || 'Spot On'}</div>
            <div className="text-xs text-neutral-500">Personal dashboard</div>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setView(it.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition ${
                view === it.key ? "bg-white shadow-md" : "hover:bg-rose-50"
              }`}
            >
              <div className="text-lg">{it.icon}</div>
              <span className="font-medium">{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-4">
          <button
            onClick={onLogout}
            className="w-full rounded-full border border-rose-100 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-rose-50"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
