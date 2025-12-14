import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withDaysOffRoast } from "@/lib/utils/brew-calculations";
import type { CoffeeInput } from "@/lib/types/database";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/coffees/[id] - Get a single coffee
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Coffee not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withDaysOffRoast(data));
}

// PATCH /api/coffees/[id] - Update a coffee
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const body: Partial<CoffeeInput> = await request.json();

  const { data, error } = await supabase
    .from("coffees")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Coffee not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withDaysOffRoast(data));
}

// DELETE /api/coffees/[id] - Delete a coffee
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("coffees").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
