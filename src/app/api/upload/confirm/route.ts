import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called by the browser after a successful PUT to R2, to persist file metadata in Supabase.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { companyId, fileId, fileKey, fileName, fileType, fileSize } = await request.json();

  if (!companyId || !fileId || !fileKey || !fileName || !fileType) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, owner_id")
    .eq("id", companyId)
    .single();

  if (companyError || !company || company.owner_id !== user.id) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("files")
    .insert({
      id: fileId,
      company_id: companyId,
      file_name: fileName,
      file_key: fileKey,
      file_type: fileType,
      size: fileSize ?? 0,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: data }, { status: 201 });
}
