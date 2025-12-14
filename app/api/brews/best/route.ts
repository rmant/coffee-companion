import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withRatio } from "@/lib/utils/brew-calculations";

// GET /api/brews/best - Get highest rated brew for a coffee (optionally filtered by brewer)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const coffee_id = searchParams.get("coffee_id");
  const brewer_id = searchParams.get("brewer_id");

  if (!coffee_id) {
    return NextResponse.json(
      { error: "coffee_id is required" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("brews")
    .select("*")
    .eq("coffee_id", coffee_id)
    .not("rating", "is", null)
    .order("rating", { ascending: false })
    .order("brewed_at", { ascending: false })
    .limit(1);

  if (brewer_id) {
    query = query.eq("brewer_id", brewer_id);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "No rated brew found for this coffee" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withRatio(data));
}
