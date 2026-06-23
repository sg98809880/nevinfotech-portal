import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { companyPrefix } from "@/lib/r2";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Company name must be at least 2 characters." }, { status: 400 });
  }

  // 1. Create the company record first so we have an id to build the R2 path from.
  const { data: company, error } = await supabase
    .from("companies")
    .insert({ name: name.trim(), owner_id: user.id, r2_path: "" })
    .select()
    .single();

  if (error || !company) {
    return NextResponse.json({ error: error?.message ?? "Could not create company." }, { status: 500 });
  }

  // 2. Now that we have the company id, write the R2 path: companies/{company-id}/
  const r2Path = companyPrefix(company.id);
  const { data: updated, error: updateError } = await supabase
    .from("companies")
    .update({ r2_path: r2Path })
    .eq("id", company.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ company: updated }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ companies: data });
}
