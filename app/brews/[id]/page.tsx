import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { withRatio, withDaysOffRoast, formatBrewTime } from "@/lib/utils/brew-calculations";
import { RatingStars } from "@/components/brew/rating-stars";
import { AIExportButton } from "@/components/brew/ai-export-button";
import Link from "next/link";

export default async function BrewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: brew, error } = await supabase
    .from("brews")
    .select("*, coffees(*), brewers(*)")
    .eq("id", id)
    .single();

  if (error || !brew) {
    notFound();
  }

  const brewWithRatio = withRatio(brew);
  const coffee = brew.coffees;
  const brewer = brew.brewers;
  const coffeeWithDays = coffee ? withDaysOffRoast(coffee) : null;
  const brewDate = new Date(brew.brewed_at);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brew Details</h1>
          <p className="text-muted-foreground">
            {brewDate.toLocaleDateString()} at{" "}
            {brewDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <AIExportButton brewId={id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Coffee & Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coffee && (
              <div>
                <p className="text-sm text-muted-foreground">Coffee</p>
                <Link
                  href={`/coffees/${coffee.id}`}
                  className="font-medium hover:underline"
                >
                  {coffee.name}
                </Link>
                <p className="text-sm text-muted-foreground">{coffee.roaster}</p>
                {coffeeWithDays?.days_off_roast !== null && (
                  <Badge variant="outline" className="mt-1">
                    {coffeeWithDays!.days_off_roast}d off roast (at time of brew)
                  </Badge>
                )}
              </div>
            )}

            {brewer && (
              <div>
                <p className="text-sm text-muted-foreground">Brewer</p>
                <p className="font-medium">{brewer.name}</p>
                <Badge variant="secondary">{brewer.type}</Badge>
              </div>
            )}

            {brew.filter_type && (
              <div>
                <p className="text-sm text-muted-foreground">Filter</p>
                <p>{brew.filter_type}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brew Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Dose</p>
                <p className="text-xl font-bold">{brew.dose_g}g</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Water</p>
                <p className="text-xl font-bold">{brew.water_g}g</p>
              </div>
              {brewWithRatio.ratio && (
                <div>
                  <p className="text-sm text-muted-foreground">Ratio</p>
                  <p className="text-xl font-bold">{brewWithRatio.ratio}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {brew.grind_setting !== null && (
                <div>
                  <p className="text-sm text-muted-foreground">Grind</p>
                  <p className="font-medium">{brew.grind_setting}</p>
                </div>
              )}
              {brew.water_temp_c !== null && (
                <div>
                  <p className="text-sm text-muted-foreground">Water Temp</p>
                  <p className="font-medium">{brew.water_temp_c}°C</p>
                </div>
              )}
            </div>

            {(brew.bloom_water_g || brew.bloom_time_s) && (
              <div>
                <p className="text-sm text-muted-foreground">Bloom</p>
                <p className="font-medium">
                  {brew.bloom_water_g && `${brew.bloom_water_g}g`}
                  {brew.bloom_water_g && brew.bloom_time_s && " for "}
                  {brew.bloom_time_s && `${brew.bloom_time_s}s`}
                </p>
              </div>
            )}

            {brew.total_time_s !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-xl font-bold">
                  {formatBrewTime(brew.total_time_s)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {brew.rating !== null && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <RatingStars value={brew.rating} readonly size="lg" />
            </div>
          )}

          {brew.tasting_notes && brew.tasting_notes.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tasting Notes</p>
              <div className="flex flex-wrap gap-2">
                {brew.tasting_notes.map((note: string, i: number) => (
                  <Badge key={i} variant="secondary">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {brew.feedback && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Feedback</p>
              <p>{brew.feedback}</p>
            </div>
          )}

          {brew.goal && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Goal for Next Brew</p>
              <p className="text-primary">{brew.goal}</p>
            </div>
          )}

          {!brew.rating &&
            !brew.tasting_notes?.length &&
            !brew.feedback &&
            !brew.goal && (
              <p className="text-muted-foreground">No results recorded</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
