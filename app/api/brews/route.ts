import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withRatio } from "@/lib/utils/brew-calculations";
import type { BrewInput } from "@/lib/types/database";

// GET /api/brews - List brews with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const coffee_id = searchParams.get("coffee_id");
  const brewer_id = searchParams.get("brewer_id");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let query = supabase
    .from("brews")
    .select("*")
    .order("brewed_at", { ascending: false })
    .limit(limit);

  if (coffee_id) {
    query = query.eq("coffee_id", coffee_id);
  }
  if (brewer_id) {
    query = query.eq("brewer_id", brewer_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add computed ratio field
  const brewsWithRatio = data.map(withRatio);

  return NextResponse.json(brewsWithRatio);
}

// POST /api/brews - Log a new brew
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body: BrewInput = await request.json();

  // Validate required fields
  if (!body.coffee_id || !body.brewer_id) {
    return NextResponse.json(
      { error: "coffee_id and brewer_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("brews")
    .insert({
      coffee_id: body.coffee_id,
      brewer_id: body.brewer_id,
      // Settings
      dose_g: body.settings?.dose_g ?? null,
      water_g: body.settings?.water_g ?? null,
      grind_setting: body.settings?.grind_setting ?? null,
      water_temp_c: body.settings?.water_temp_c ?? null,
      bloom_water_g: body.settings?.bloom_water_g ?? null,
      bloom_time_s: body.settings?.bloom_time_s ?? null,
      total_time_s: body.settings?.total_time_s ?? null,
      filter_type: body.settings?.filter_type ?? null,
      // Results
      rating: body.result?.rating ?? null,
      tasting_notes: body.result?.tasting_notes ?? [],
      feedback: body.result?.feedback ?? null,
      goal: body.result?.goal ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withRatio(data), { status: 201 });
}
