import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BrewerInput } from "@/lib/types/database";

// GET /api/brewers - List all brewers
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brewers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/brewers - Create a new brewer
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body: BrewerInput = await request.json();

  // Validate required fields
  if (!body.name || !body.type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("brewers")
    .insert({
      name: body.name,
      type: body.type,
      filter_type: body.filter_type || null,
      default_dose_g: body.default_dose_g || null,
      default_ratio: body.default_ratio || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
