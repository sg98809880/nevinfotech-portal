"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400">
          ✓
        </div>
        <h2 className="font-display text-lg font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We sent a verification link to <span className="font-medium text-ink-700 dark:text-ink-200">{email}</span>.
          Open it to activate your account, then sign in.
        </p>
        <a href="/login" className="mt-4 inline-block text-sm font-medium text-gold-700 dark:text-gold-400 hover:underline">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Full name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Asha Rao"
          className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Work email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-ink-900 dark:bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-gold-400 transition-colors disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-gold-700 dark:text-gold-400 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
