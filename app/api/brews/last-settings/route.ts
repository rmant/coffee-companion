import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BrewSettings } from "@/lib/types/database";

// GET /api/brews/last-settings - Get last used settings for a coffee/brewer combo
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const coffee_id = searchParams.get("coffee_id");
  const brewer_id = searchParams.get("brewer_id");

  if (!coffee_id || !brewer_id) {
    return NextResponse.json(
      { error: "coffee_id and brewer_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("brews")
    .select(
      "dose_g, water_g, grind_setting, water_temp_c, bloom_water_g, bloom_time_s, total_time_s, filter_type"
    )
    .eq("coffee_id", coffee_id)
    .eq("brewer_id", brewer_id)
    .order("brewed_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "No previous brew found for this combo" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: BrewSettings = {
    dose_g: data.dose_g,
    water_g: data.water_g,
    grind_setting: data.grind_setting,
    water_temp_c: data.water_temp_c,
    bloom_water_g: data.bloom_water_g,
    bloom_time_s: data.bloom_time_s,
    total_time_s: data.total_time_s,
    filter_type: data.filter_type,
  };

  return NextResponse.json(settings);
}
