import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Navbar email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-gold-600 dark:text-gold-400">
              Workspace
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Companies</h1>
          </div>
          <Link
            href="/company/new"
            className="rounded-md bg-ink-900 dark:bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-gold-400 transition-colors"
          >
            + New company
          </Link>
        </div>

        {!companies || companies.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-ink-200 dark:border-ink-700 px-6 py-16 text-center">
            <p className="font-display text-lg font-medium">No companies yet</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Create your first company to get a private file storage path.
            </p>
            <Link
              href="/company/new"
              className="mt-5 inline-block rounded-md bg-ink-900 dark:bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-gold-400 transition-colors"
            >
              Create a company
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/company/${c.id}/upload`}
                className="group rounded-lg border border-ink-100 dark:border-ink-800 bg-[rgb(var(--surface))] p-5 ledger-rule hover:border-gold-300 dark:hover:border-gold-700 transition-colors"
              >
                <p className="font-display text-base font-semibold tracking-tight text-ink-800 dark:text-ink-100 group-hover:text-gold-700 dark:group-hover:text-gold-400">
                  {c.name}
                </p>
                <p className="mt-1 font-mono text-xs text-ink-400">
                  companies/{c.id.slice(0, 8)}…/
                </p>
                <p className="mt-3 text-xs text-ink-400">Created {formatDate(c.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
