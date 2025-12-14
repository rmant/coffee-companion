import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/settings - Get user settings
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is okay
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || { grinder: null, kettle: null });
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { grinder, kettle } = body;

  // Check if settings exist
  const { data: existing } = await supabase
    .from("user_settings")
    .select("id")
    .limit(1)
    .single();

  let result;

  if (existing) {
    // Update existing
    result = await supabase
      .from("user_settings")
      .update({
        grinder: grinder ?? null,
        kettle: kettle ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("user_settings")
      .insert({
        grinder: grinder ?? null,
        kettle: kettle ?? null,
      })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
