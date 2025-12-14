import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { withDaysOffRoast } from "@/lib/utils/brew-calculations";
import type { CoffeeStatus } from "@/lib/types/database";

export default async function CoffeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status as CoffeeStatus) || "active";
  const supabase = await createClient();

  const { data: coffees } = await supabase
    .from("coffees")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  const statusConfig: Record<CoffeeStatus, { label: string; color: string }> = {
    active: { label: "ACTIVOS", color: "var(--amber)" },
    finished: { label: "TERMINADOS", color: "var(--crema)" },
    wishlist: { label: "DESEOS", color: "var(--stone)" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="section-header">
        <div className="flex-1">
          <h1 className="section-title">COLECCIÓN DE CAFÉS</h1>
          <p className="section-subtitle mt-1">Tus granos, curados con cariño</p>
        </div>
        <Link href="/coffees/new" className="btn-brutalist">
          <span className="btn-brutalist-plus">+</span>
          <span className="hidden md:inline">AGREGAR</span>
        </Link>
      </section>

      {/* Tabs - Brutalist style */}
      <div className="flex gap-1 border-b-2 border-concrete-light">
        {(["active", "finished", "wishlist"] as CoffeeStatus[]).map((s) => {
          const isActive = s === status;
          const config = statusConfig[s];
          return (
            <Link
              key={s}
              href={`/coffees?status=${s}`}
              className={`
                relative px-6 py-4 font-display text-sm tracking-wider transition-all
                ${isActive
                  ? "bg-concrete text-paper"
                  : "text-stone hover:text-paper hover:bg-concrete/50"
                }
              `}
            >
              {config.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: config.color }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Coffee Grid */}
      {coffees && coffees.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {coffees.map((coffee) => {
            const coffeeWithDays = withDaysOffRoast(coffee);

            return (
              <Link key={coffee.id} href={`/coffees/${coffee.id}`}>
                <article className="brutalist-card group h-full">
                  {/* Header with name and days */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl text-paper group-hover:text-amber transition-colors truncate">
                        {coffee.name.toUpperCase()}
                      </h3>
                      <p className="font-body text-sm text-stone truncate italic">
                        {coffee.roaster}
                      </p>
                    </div>
                    {coffeeWithDays.days_off_roast !== null && (
                      <div className="brutalist-badge flex-shrink-0">
                        {coffeeWithDays.days_off_roast}D
                      </div>
                    )}
                  </div>

                  {/* Origin */}
                  {coffee.origin && (
                    <div className="flex items-center gap-2 mb-4 font-mono text-xs text-stone uppercase tracking-wider">
                      <span className="text-amber">//</span>
                      {coffee.origin}
                    </div>
                  )}

                  {/* Process & Roast tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {coffee.process && (
                      <span className="brutalist-tag text-xs">
                        {coffee.process}
                      </span>
                    )}
                    {coffee.roast_level && (
                      <span className="brutalist-tag text-xs">
                        {coffee.roast_level}
                      </span>
                    )}
                  </div>

                  {/* Flavor notes */}
                  {coffee.flavor_notes && coffee.flavor_notes.length > 0 && (
                    <div className="pt-4 border-t border-concrete-light">
                      <p className="font-body text-sm text-amber italic">
                        {coffee.flavor_notes.join(" · ")}
                      </p>
                    </div>
                  )}
                </article>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="brutalist-card p-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-charred border-2 border-concrete-light mb-8">
            <span className="font-display text-5xl text-amber opacity-30">C</span>
          </div>
          <p className="font-display text-2xl text-paper mb-2">
            SIN CAFÉS {statusConfig[status].label}
          </p>
          <p className="font-body text-stone italic mb-8">
            {status === "active"
              ? "¡Es hora de agregar algunos granos!"
              : status === "wishlist"
                ? "¿Qué te gustaría probar?"
                : "¡Prepara más para terminar más!"
            }
          </p>
          {status !== "finished" && (
            <Link href="/coffees/new" className="btn-brutalist">
              <span className="btn-brutalist-plus">+</span>
              AGREGAR PRIMER CAFÉ
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
