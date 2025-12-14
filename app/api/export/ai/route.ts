import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  withDaysOffRoast,
  withRatio,
  generateAIPromptContext,
} from "@/lib/utils/brew-calculations";
import type { AIExport } from "@/lib/types/database";

// GET /api/export/ai - Export brew data for AI analysis
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const brew_id = searchParams.get("brew_id");
  const coffee_id = searchParams.get("coffee_id");
  const include_history = parseInt(searchParams.get("include_history") || "3", 10);

  // Get user settings for equipment
  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("*")
    .limit(1)
    .single();

  const equipment = {
    grinder: settingsData?.grinder || null,
    kettle: settingsData?.kettle || null,
  };

  let currentBrew = null;
  let coffee = null;
  let brewer = null;
  let recentBrews: ReturnType<typeof withRatio>[] = [];

  // If brew_id provided, get that specific brew
  if (brew_id) {
    const { data: brewData, error: brewError } = await supabase
      .from("brews")
      .select("*")
      .eq("id", brew_id)
      .single();

    if (brewError) {
      return NextResponse.json({ error: "Brew not found" }, { status: 404 });
    }

    currentBrew = withRatio(brewData);

    // Get the associated coffee
    const { data: coffeeData } = await supabase
      .from("coffees")
      .select("*")
      .eq("id", brewData.coffee_id)
      .single();

    if (coffeeData) {
      coffee = withDaysOffRoast(coffeeData);
    }

    // Get the associated brewer
    if (brewData.brewer_id) {
      const { data: brewerData } = await supabase
        .from("brewers")
        .select("*")
        .eq("id", brewData.brewer_id)
        .single();

      brewer = brewerData || null;
    }

    // Get recent brews for context (excluding current)
    if (include_history > 0) {
      const { data: historyData } = await supabase
        .from("brews")
        .select("*")
        .eq("coffee_id", brewData.coffee_id)
        .neq("id", brew_id)
        .order("brewed_at", { ascending: false })
        .limit(include_history);

      if (historyData) {
        recentBrews = historyData.map(withRatio);
      }
    }
  }
  // If only coffee_id provided, get recent brews for that coffee
  else if (coffee_id) {
    const { data: coffeeData, error: coffeeError } = await supabase
      .from("coffees")
      .select("*")
      .eq("id", coffee_id)
      .single();

    if (coffeeError) {
      return NextResponse.json({ error: "Coffee not found" }, { status: 404 });
    }

    coffee = withDaysOffRoast(coffeeData);

    // Get recent brews
    const { data: brewsData } = await supabase
      .from("brews")
      .select("*")
      .eq("coffee_id", coffee_id)
      .order("brewed_at", { ascending: false })
      .limit(include_history + 1);

    if (brewsData && brewsData.length > 0) {
      currentBrew = withRatio(brewsData[0]);
      recentBrews = brewsData.slice(1).map(withRatio);

      // Get brewer for most recent brew
      if (brewsData[0].brewer_id) {
        const { data: brewerData } = await supabase
          .from("brewers")
          .select("*")
          .eq("id", brewsData[0].brewer_id)
          .single();

        brewer = brewerData || null;
      }
    }
  } else {
    return NextResponse.json(
      { error: "Either brew_id or coffee_id is required" },
      { status: 400 }
    );
  }

  // Generate the prompt context
  const prompt_context = generateAIPromptContext({
    equipment,
    brewer,
    coffee,
    current_brew: currentBrew,
    recent_brews: recentBrews,
  });

  const exportData: AIExport = {
    equipment,
    brewer,
    coffee,
    current_brew: currentBrew,
    recent_brews: recentBrews,
    prompt_context,
  };

  return NextResponse.json(exportData);
}
