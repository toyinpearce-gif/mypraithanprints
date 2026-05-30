"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Login failed.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={login} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">PraiThan Admin</p>
        <h1 className="mt-3 text-3xl font-black">Admin Login</h1>
        <p className="mt-2 text-slate-600">Enter the admin password configured in Vercel.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Admin password"
          className="mt-6 w-full rounded-2xl border px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100"
          required
        />
        {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <a href="/" className="mt-4 block text-center text-sm font-bold text-slate-600">Back to Store</a>
      </form>
    </main>
  );
}
