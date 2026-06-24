import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();

    return NextResponse.json({
      deployed: true,
      received: body
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e?.message || "unknown"
    }, { status: 500 });
  }
}
