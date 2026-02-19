import React, { useState } from "react";

async function authRequest(mode, email, password, username) {
  const body =
    mode === "signup"
      ? { username, email, password }
      : { email, password };

  const res = await fetch(`/api/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Authentication failed");
  }

  return res.json();
}

export function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authRequest(mode, email, password, username);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full">
      <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-xl">
        {/* Tabs */}
        <div className="mb-8 flex rounded-full bg-rose-50 p-1">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-white shadow text-rose-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Create account
          </button>

          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white shadow text-rose-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Log in
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 outline-none transition focus:border-rose-300 focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 outline-none transition focus:border-rose-300 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 outline-none transition focus:border-rose-300 focus:bg-white"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-medium text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 disabled:opacity-70"
          >
            {loading
              ? "Please wait…"
              : mode === "signup"
              ? "Create account"
              : "Log in"}
          </button>

          <p className="pt-2 text-center text-xs leading-relaxed text-neutral-500">
            Your data is stored securely and used only for predictions and
            insights.
          </p>
        </form>
      </div>
    </section>
  );
}
