import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      companyId,
      fileId,
      fileKey,
      fileName,
      fileType,
      fileSize,
    } = body;

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        id: fileId,
        company_id: companyId,
        file_name: fileName,
        file_key: fileKey,
        file_type: fileType,
        size: fileSize || 0,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        file: data,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Unknown error",
        stack: String(err),
      },
      { status: 500 }
    );
  }
}
