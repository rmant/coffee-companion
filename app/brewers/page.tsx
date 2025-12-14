import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const brewerTypeLabels: Record<string, string> = {
  v60: "V60",
  chemex: "Chemex",
  origami: "Origami",
  aeropress: "AeroPress",
  kalita: "Kalita Wave",
  other: "Other",
};

export default async function BrewersPage() {
  const supabase = await createClient();

  const { data: brewers } = await supabase
    .from("brewers")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brewers</h1>
          <p className="text-muted-foreground">Your pour-over equipment</p>
        </div>
        <Link href="/brewers/new">
          <Button>Add Brewer</Button>
        </Link>
      </div>

      {brewers && brewers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brewers.map((brewer) => (
            <Card key={brewer.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{brewer.name}</h3>
                      <Badge variant="secondary">
                        {brewerTypeLabels[brewer.type] || brewer.type}
                      </Badge>
                    </div>
                  </div>

                  {brewer.filter_type && (
                    <p className="text-sm text-muted-foreground">
                      Filter: {brewer.filter_type}
                    </p>
                  )}

                  {(brewer.default_dose_g || brewer.default_ratio) && (
                    <p className="text-sm text-muted-foreground">
                      Default: {brewer.default_dose_g && `${brewer.default_dose_g}g`}
                      {brewer.default_dose_g && brewer.default_ratio && " @ "}
                      {brewer.default_ratio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No brewers yet</p>
          <Link href="/brewers/new">
            <Button variant="outline">Add your first brewer</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
