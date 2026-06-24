import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { buildFileKey, getPresignedUploadUrl } from "@/lib/r2";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      companyId,
      fileName,
      fileType,
      fileSize
    } = body;

    if (!companyId || !fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_FILE_TYPES[fileType]) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      );
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        {
          error: "Company lookup failed",
          details: companyError
        },
        { status: 404 }
      );
    }

    const fileId = uuidv4();

    const fileKey = buildFileKey(
      companyId,
      fileId,
      fileName
    );

    const uploadUrl = await getPresignedUploadUrl(
      fileKey,
      fileType
    );

    return NextResponse.json({
      fileId,
      fileKey,
      uploadUrl
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Unknown error",
        stack: String(err)
      },
      { status: 500 }
    );
  }
}
