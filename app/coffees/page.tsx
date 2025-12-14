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

  const statusConfig: Record<CoffeeStatus, { label: string; color: string; stampText: string }> = {
    active: { label: "Activos", color: "#5c6b4a", stampText: "en rotación" },
    finished: { label: "Terminados", color: "#6b4423", stampText: "agotado" },
    wishlist: { label: "Lista de Deseos", color: "#c45c3e", stampText: "por probar" },
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <section className="flex items-end justify-between">
        <div>
          <h1
            className="text-4xl font-bold text-[#3c2415] tracking-tight"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Colección de Cafés
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Tus granos, curados con cariño
          </p>
        </div>
        <Link
          href="/coffees/new"
          className="btn-vintage text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Agregar Café
        </Link>
      </section>

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-border/60 pb-0">
        {(["active", "finished", "wishlist"] as CoffeeStatus[]).map((s) => {
          const isActive = s === status;
          return (
            <Link
              key={s}
              href={`/coffees?status=${s}`}
              className={`
                relative px-4 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? "text-[#3c2415]"
                  : "text-muted-foreground hover:text-[#3c2415]"
                }
              `}
            >
              {statusConfig[s].label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: statusConfig[s].color }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Cuadrícula de Cafés */}
      {coffees && coffees.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {coffees.map((coffee) => {
            const coffeeWithDays = withDaysOffRoast(coffee);
            const config = statusConfig[status];

            return (
              <Link key={coffee.id} href={`/coffees/${coffee.id}`}>
                <article className="journal-card p-5 h-full group">
                  {/* Encabezado con nombre y sello */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-lg text-[#3c2415] group-hover:text-[#c45c3e] transition-colors truncate"
                        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                      >
                        {coffee.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {coffee.roaster}
                      </p>
                    </div>
                    {coffeeWithDays.days_off_roast !== null && (
                      <div
                        className="stamp text-[10px] px-2 py-1 flex-shrink-0"
                        style={{ color: config.color }}
                      >
                        {coffeeWithDays.days_off_roast}d
                      </div>
                    )}
                  </div>

                  {/* Origen */}
                  {coffee.origin && (
                    <p className="text-sm text-[#5c6b4a] mb-3 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2 7h10M7 2a10 10 0 000 10M7 2a10 10 0 010 10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                      </svg>
                      {coffee.origin}
                    </p>
                  )}

                  {/* Etiquetas de proceso y tueste */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {coffee.process && (
                      <span className="indie-tag">
                        {coffee.process}
                      </span>
                    )}
                    {coffee.roast_level && (
                      <span className="indie-tag">
                        {coffee.roast_level}
                      </span>
                    )}
                  </div>

                  {/* Notas de sabor */}
                  {coffee.flavor_notes && coffee.flavor_notes.length > 0 && (
                    <div className="pt-3 border-t border-border/40">
                      <p
                        className="text-sm text-[#c45c3e]"
                        style={{ fontFamily: "var(--font-hand), cursive" }}
                      >
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
        <div className="journal-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f0ebe3] mb-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[#6b4423]">
              <ellipse cx="20" cy="20" rx="10" ry="15" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 8c-2 4-2 10 0 12s2 10 0 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            Sin cafés {statusConfig[status].label.toLowerCase()}
          </p>
          <p
            className="text-[#c45c3e] mb-6"
            style={{ fontFamily: "var(--font-hand), cursive" }}
          >
            {status === "active"
              ? "¡es hora de agregar algunos granos!"
              : status === "wishlist"
                ? "¿qué te gustaría probar?"
                : "¡prepara más para terminar más!"
            }
          </p>
          {status !== "finished" && (
            <Link
              href="/coffees/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-[#c45c3e] text-[#c45c3e] rounded-lg hover:bg-[#c45c3e] hover:text-white transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Agregar tu primer café
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
