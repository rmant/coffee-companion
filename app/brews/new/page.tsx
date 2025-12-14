import { createClient } from "@/lib/supabase/server";
import { FlowContainer } from "@/components/flow";

export default async function NewBrewPage() {
  const supabase = await createClient();

  // Fetch active coffees and all brewers
  const [{ data: coffees }, { data: brewers }] = await Promise.all([
    supabase
      .from("coffees")
      .select("id, name, roaster, origin, roast_date, flavor_notes")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("brewers")
      .select("id, name, type, default_dose_g, default_ratio")
      .order("name", { ascending: true }),
  ]);

  return (
    <FlowContainer
      coffees={coffees || []}
      brewers={brewers || []}
    />
  );
}
