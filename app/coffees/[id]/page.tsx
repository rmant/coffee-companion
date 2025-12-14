import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { withDaysOffRoast, withRatio, formatBrewTime } from "@/lib/utils/brew-calculations";
import { DeleteCoffeeButton } from "@/components/coffee/delete-coffee-button";

export default async function CoffeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coffee, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !coffee) {
    notFound();
  }

  // Fetch brews for this coffee
  const { data: brews } = await supabase
    .from("brews")
    .select("*, brewers(name)")
    .eq("coffee_id", id)
    .order("brewed_at", { ascending: false })
    .limit(10);

  // Fetch best brew
  const { data: bestBrew } = await supabase
    .from("brews")
    .select("*")
    .eq("coffee_id", id)
    .not("rating", "is", null)
    .order("rating", { ascending: false })
    .limit(1)
    .single();

  const coffeeWithDays = withDaysOffRoast(coffee);

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-700",
    finished: "bg-gray-500/10 text-gray-700",
    wishlist: "bg-blue-500/10 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{coffee.name}</h1>
            <Badge className={statusColors[coffee.status]}>{coffee.status}</Badge>
          </div>
          <p className="text-lg text-muted-foreground">{coffee.roaster}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/coffees/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <DeleteCoffeeButton id={id} name={coffee.name} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Coffee Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coffee.origin && (
              <div>
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-medium">{coffee.origin}</p>
              </div>
            )}

            <div className="flex gap-8">
              {coffee.process && (
                <div>
                  <p className="text-sm text-muted-foreground">Process</p>
                  <p className="font-medium capitalize">{coffee.process}</p>
                </div>
              )}
              {coffee.roast_level && (
                <div>
                  <p className="text-sm text-muted-foreground">Roast</p>
                  <p className="font-medium capitalize">{coffee.roast_level}</p>
                </div>
              )}
            </div>

            {coffee.roast_date && (
              <div>
                <p className="text-sm text-muted-foreground">Roast Date</p>
                <p className="font-medium">
                  {new Date(coffee.roast_date).toLocaleDateString()}
                  {coffeeWithDays.days_off_roast !== null && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({coffeeWithDays.days_off_roast} days ago)
                    </span>
                  )}
                </p>
              </div>
            )}

            {coffee.flavor_notes && coffee.flavor_notes.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Flavor Notes</p>
                <div className="flex flex-wrap gap-2">
                  {coffee.flavor_notes.map((note: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {note}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Best Brew */}
        <Card>
          <CardHeader>
            <CardTitle>Brewing Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Brews</p>
              <p className="text-2xl font-bold">{brews?.length || 0}</p>
            </div>

            {bestBrew && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Best Brew</p>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {bestBrew.dose_g}g / {bestBrew.water_g}g
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{bestBrew.rating}/5</span>
                      </div>
                    </div>
                    {bestBrew.grind_setting && (
                      <p className="text-sm text-muted-foreground">
                        Grind: {bestBrew.grind_setting}
                      </p>
                    )}
                    {bestBrew.total_time_s && (
                      <p className="text-sm text-muted-foreground">
                        Time: {formatBrewTime(bestBrew.total_time_s)}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <Link href={`/brews/new?coffee_id=${id}`}>
              <Button className="w-full">Log a Brew</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Brews */}
      {brews && brews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Brews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brews.map((brew) => {
                const brewWithRatio = withRatio(brew);
                const brewer = brew.brewers as { name: string } | null;
                return (
                  <Link
                    key={brew.id}
                    href={`/brews/${brew.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {brew.dose_g}g / {brew.water_g}g
                        {brewWithRatio.ratio && ` (${brewWithRatio.ratio})`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {brewer?.name} • {formatBrewTime(brew.total_time_s)}
                      </p>
                    </div>
                    <div className="text-right">
                      {brew.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{brew.rating}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(brew.brewed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
