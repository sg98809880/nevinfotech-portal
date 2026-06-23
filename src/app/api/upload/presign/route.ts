import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { buildFileKey, getPresignedUploadUrl } from "@/lib/r2";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { companyId, fileName, fileType, fileSize } = await request.json();

  if (!companyId || !fileName || !fileType) {
    return NextResponse.json({ error: "companyId, fileName and fileType are required." }, { status: 400 });
  }

  if (!ACCEPTED_FILE_TYPES[fileType]) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: PDF, DOCX, XLSX, PNG, JPG." },
      { status: 415 }
    );
  }

  if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds the 25 MB limit." }, { status: 413 });
  }

  // Confirm the company belongs to this user before issuing a signed URL.
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, owner_id")
    .eq("id", companyId)
    .single();

  if (companyError || !company || company.owner_id !== user.id) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const fileId = uuidv4();
  const fileKey = buildFileKey(companyId, fileId, fileName);
  const uploadUrl = await getPresignedUploadUrl(fileKey, fileType);

  return NextResponse.json({ fileId, fileKey, uploadUrl });
}
