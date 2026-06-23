"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompanyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(body.error ?? "Could not create company.");
      return;
    }

    router.push(`/company/${body.company.id}/upload`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
          Company name
        </label>
        <input
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. N.J. Suresh & Associates"
          className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
        <p className="mt-2 text-xs text-ink-400">
          This creates a record in Supabase and reserves a private storage path —{" "}
          <code className="font-mono">companies/&#123;company-id&#125;/</code> — in Cloudflare R2 for this company's files.
        </p>
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
        {loading ? "Creating company…" : "Create company & continue"}
      </button>
    </form>
  );
}
