import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { CompanyForm } from "@/components/CompanyForm";

export default async function NewCompanyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar email={user.email} />
      <main className="mx-auto max-w-lg px-4 py-14 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-gold-600 dark:text-gold-400">
          Step 1 of 2
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">Create a company</h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          Each company gets its own private storage path for documents and records.
        </p>
        <div className="mt-8 rounded-lg border border-ink-100 dark:border-ink-800 bg-[rgb(var(--surface))] p-6">
          <CompanyForm />
        </div>
      </main>
    </div>
  );
}
