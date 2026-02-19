import React, { useEffect, useState } from "react";
import { Landing } from "./components/Landing.jsx";
import { Auth } from "./components/Auth.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import logo from "./assets/logo.png";

const TOKEN_KEY = "spoton_token";
const USER_KEY = "spoton_user";

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [view, setView] = useState(user ? "dashboard" : "landing");

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user, token]);

  const handleAuthSuccess = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white text-neutral-800">
      {/* HEADER - minimal navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-rose-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo Left */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Spot On" className="h-10 w-10 object-contain" />
            <div className="text-lg font-serif font-extrabold tracking-tight">Spot On</div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-neutral-700 border border-rose-200 rounded-lg hover:bg-rose-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setView("auth")} className="px-4 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-rose-50">
                  Log in
                </button>
                <button onClick={() => setView("auth")} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-md">
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {view === "landing" && (
          <Landing onGetStarted={() => setView("auth")} />
        )}

        {view === "auth" && (
          <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <Auth onAuthSuccess={handleAuthSuccess} />
          </div>
        )}

        {view === "dashboard" && user && token && (
          <Dashboard user={user} token={token} onLogout={handleLogout} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-rose-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-neutral-500">
          Spot On does not replace medical advice. Always consult your doctor
          for medical concerns.
        </div>
      </footer>
    </div>
  );
}
