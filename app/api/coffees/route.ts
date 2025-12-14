import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withDaysOffRoast } from "@/lib/utils/brew-calculations";
import type { CoffeeInput, CoffeeStatus } from "@/lib/types/database";

// GET /api/coffees - List all coffees with optional status filter
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as CoffeeStatus | null;

  let query = supabase
    .from("coffees")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add computed days_off_roast field
  const coffeesWithDays = data.map(withDaysOffRoast);

  return NextResponse.json(coffeesWithDays);
}

// POST /api/coffees - Create a new coffee
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body: CoffeeInput = await request.json();

  // Validate required fields
  if (!body.name || !body.roaster) {
    return NextResponse.json(
      { error: "Name and roaster are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("coffees")
    .insert({
      name: body.name,
      roaster: body.roaster,
      origin: body.origin || null,
      process: body.process || null,
      roast_level: body.roast_level || null,
      roast_date: body.roast_date || null,
      flavor_notes: body.flavor_notes || [],
      status: body.status || "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withDaysOffRoast(data), { status: 201 });
}
