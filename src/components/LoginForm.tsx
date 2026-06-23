"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "azure" | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }

    if (data.user && !data.user.email_confirmed_at) {
      router.push("/verify-email");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "azure") {
    setError(null);
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] px-4 py-2.5 text-sm font-medium text-ink-700 dark:text-ink-200 hover:border-gold-400 transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.98.66-2.23 1.06-3.73 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.43 3.44 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.95 10.95 0 0 0 12 1 10.99 10.99 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("azure")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] px-4 py-2.5 text-sm font-medium text-ink-700 dark:text-ink-200 hover:border-gold-400 transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 23 23">
            <path fill="#f25022" d="M1 1h10v10H1z"/>
            <path fill="#00a4ef" d="M1 12h10v10H1z"/>
            <path fill="#7fba00" d="M12 1h10v10H12z"/>
            <path fill="#ffb900" d="M12 12h10v10H12z"/>
          </svg>
          Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
        <span className="text-xs uppercase tracking-wider text-ink-400">or sign in with email</span>
        <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200">Password</label>
            <a href="#" className="text-xs text-gold-700 dark:text-gold-400 hover:underline">Forgot password?</a>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          disabled={loading !== null}
          className="w-full rounded-md bg-ink-900 dark:bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-gold-400 transition-colors disabled:opacity-50"
        >
          {loading === "email" ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        New to NevInfotech?{" "}
        <a href="/register" className="font-medium text-gold-700 dark:text-gold-400 hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
}
