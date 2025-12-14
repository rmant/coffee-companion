import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { withRatio, formatBrewTime } from "@/lib/utils/brew-calculations";

// Componente de calificación con granos de café
function CoffeeBeanRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((bean) => (
        <svg
          key={bean}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={bean <= rating ? "text-[#6b4423]" : "text-[#e8e0d5]"}
        >
          <ellipse cx="12" cy="12" rx="6" ry="10" fill="currentColor" />
          <path
            d="M12 4c-1 2-1 6 0 8s1 6 0 8"
            stroke={bean <= rating ? "#3c2415" : "#d4cdc4"}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}

export default async function BrewsPage() {
  const supabase = await createClient();

  const { data: brews } = await supabase
    .from("brews")
    .select("*, coffees(name, roaster), brewers(name, type)")
    .order("brewed_at", { ascending: false })
    .limit(50);

  // Agrupar preparaciones por fecha
  type BrewWithRelations = NonNullable<typeof brews>[number];
  const brewsByDate = brews?.reduce<Record<string, BrewWithRelations[]>>((acc, brew) => {
    const date = new Date(brew.brewed_at).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(brew);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <section className="flex items-end justify-between">
        <div>
          <h1
            className="text-4xl font-bold text-[#3c2415] tracking-tight"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Historial de Preparaciones
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Tu viaje cafetero, documentado
          </p>
        </div>
        <Link
          href="/brews/new"
          className="btn-vintage text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Registrar
        </Link>
      </section>

      {/* Lista de Preparaciones */}
      {brews && brews.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(brewsByDate || {}).map(([date, dateBrews]) => (
            <section key={date}>
              {/* Encabezado de Fecha */}
              <div className="flex items-center gap-4 mb-4">
                <h2
                  className="text-sm font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {date}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              </div>

              {/* Preparaciones de esta fecha */}
              <div className="space-y-4 stagger-children">
                {dateBrews?.map((brew) => {
                  const brewWithRatio = withRatio(brew);
                  const coffee = brew.coffees as { name: string; roaster: string } | null;
                  const brewer = brew.brewers as { name: string; type: string } | null;
                  const brewTime = new Date(brew.brewed_at).toLocaleTimeString("es-ES", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <Link key={brew.id} href={`/brews/${brew.id}`}>
                      <article className="journal-card p-5 group">
                        <div className="flex items-start justify-between gap-4">
                          {/* Lado izquierdo - Info del café */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3
                                className="font-semibold text-lg text-[#3c2415] group-hover:text-[#c45c3e] transition-colors truncate"
                                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                              >
                                {coffee?.name || "Café Desconocido"}
                              </h3>
                              {brew.rating && (
                                <CoffeeBeanRating rating={brew.rating} />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {coffee?.roaster}
                              {brewer && (
                                <span className="text-[#5c6b4a]"> · {brewer.name}</span>
                              )}
                            </p>
                          </div>

                          {/* Lado derecho - Parámetros */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <span className="font-mono text-sm bg-[#f0ebe3] px-2 py-1 rounded text-[#3c2415]">
                                {brew.dose_g}g : {brew.water_g}g
                              </span>
                              {brewWithRatio.ratio && (
                                <span className="stamp text-[10px] px-2 py-0.5 text-[#5c6b4a]">
                                  {brewWithRatio.ratio}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatBrewTime(brew.total_time_s)} · {brewTime}
                            </p>
                          </div>
                        </div>

                        {/* Notas de cata y comentarios */}
                        {(brew.tasting_notes?.length > 0 || brew.feedback) && (
                          <div className="mt-4 pt-4 border-t border-border/40">
                            {brew.tasting_notes && brew.tasting_notes.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {brew.tasting_notes.map((note: string, i: number) => (
                                  <span key={i} className="indie-tag text-xs">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            )}
                            {brew.feedback && (
                              <p
                                className="text-sm text-[#c45c3e] line-clamp-2"
                                style={{ fontFamily: "var(--font-hand), cursive" }}
                              >
                                "{brew.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Objetivo si está definido */}
                        {brew.goal && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-60">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                              <circle cx="6" cy="6" r="2" fill="currentColor" />
                            </svg>
                            Objetivo: {brew.goal}
                          </div>
                        )}
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="journal-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f0ebe3] mb-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[#6b4423]">
              <path
                d="M8 12h20v18a5 5 0 01-5 5H13a5 5 0 01-5-5V12z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M28 15h3a4 4 0 010 8h-3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M13 6c0-1.5 1-3 3-3s3 1.5 3 3M18 6c0-1.5 1-3 3-3s3 1.5 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            Sin preparaciones registradas
          </p>
          <p
            className="text-[#c45c3e] mb-6"
            style={{ fontFamily: "var(--font-hand), cursive" }}
          >
            tu primera taza espera ser documentada
          </p>
          <Link
            href="/brews/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-[#c45c3e] text-[#c45c3e] rounded-lg hover:bg-[#c45c3e] hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Registrar tu primera preparación
          </Link>
        </div>
      )}

      {/* Pie decorativo */}
      {brews && brews.length > 0 && (
        <div className="divider-coffee text-xs uppercase tracking-widest">
          {brews.length} preparaciones documentadas
        </div>
      )}
    </div>
  );
}
