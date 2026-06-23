import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { FileUploader } from "@/components/FileUploader";

export default async function CompanyUploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!company) notFound();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("company_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Navbar email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/dashboard" className="text-xs text-ink-400 hover:text-gold-600 dark:hover:text-gold-400">
          ← All companies
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{company.name}</h1>
          <span className="font-mono text-xs text-ink-400">{company.r2_path}</span>
        </div>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          Upload PDF, DOCX, XLSX, PNG, or JPG files. Each one is stored privately under this
          company's R2 path and logged in the file ledger below.
        </p>

        <div className="mt-8">
          <FileUploader companyId={company.id} initialFiles={files ?? []} />
        </div>
      </main>
    </div>
  );
}
