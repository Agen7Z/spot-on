import React, { useState } from "react";

export function AIAssistant({ token }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Hi — I can help explain cycle insights. Ask me anything." }]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e?.preventDefault();
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setText("");
    setLoading(true);
    try {
      const res = await fetch(`/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: q }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { from: "bot", text: data.reply || "Sorry, I couldn't generate a reply." }]);
    } catch (err) {
      console.error(err);
      setMsgs((m) => [...m, { from: "bot", text: "Assistant error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="fixed right-6 bottom-6 z-50 rounded-full bg-pink-500 px-4 py-3 text-white shadow-lg">
        Ask AI
      </button>

      {open && (
        <div className="fixed right-6 bottom-20 z-50 w-80 rounded-xl bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium">AI Assistant</div>
            <button onClick={() => setOpen(false)} className="text-sm text-neutral-500">Close</button>
          </div>

          <div className="mb-2 max-h-48 space-y-2 overflow-auto text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={`${m.from === "bot" ? "text-neutral-600" : "text-right"}`}>
                <div className={`${m.from === "bot" ? "inline-block bg-rose-50 px-3 py-1 rounded" : "inline-block bg-pink-50 px-3 py-1 rounded"}`}>{m.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about your cycle…" className="w-full rounded-md border px-2 py-1 text-sm" />
            <button disabled={loading} className="rounded-md bg-pink-500 px-3 py-1 text-white text-sm">{loading ? "…" : "Send"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
