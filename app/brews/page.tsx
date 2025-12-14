import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { withRatio, formatBrewTime } from "@/lib/utils/brew-calculations";

// Brutalist rating display
function BrutalistRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((bean) => (
        <div
          key={bean}
          className={`w-3 h-3 ${
            bean <= rating ? "bg-amber" : "bg-concrete-light"
          }`}
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        />
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

  // Group brews by date
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
      {/* Header */}
      <section className="section-header">
        <div className="flex-1">
          <h1 className="section-title">HISTORIAL</h1>
          <p className="section-subtitle mt-1">Tu viaje cafetero, documentado</p>
        </div>
        <Link href="/brews/new" className="btn-brutalist">
          <span className="btn-brutalist-plus">+</span>
          <span className="hidden md:inline">REGISTRAR</span>
        </Link>
      </section>

      {/* Brews List */}
      {brews && brews.length > 0 ? (
        <div className="space-y-10">
          {Object.entries(brewsByDate || {}).map(([date, dateBrews]) => (
            <section key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-mono text-xs text-stone uppercase tracking-[0.2em] whitespace-nowrap">
                  {date}
                </h2>
                <div className="flex-1 h-px bg-concrete-light" />
                <span className="font-mono text-xs text-amber">{dateBrews.length}</span>
              </div>

              {/* Brews for this date */}
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
                      <article className="brutalist-card group">
                        <div className="flex items-start justify-between gap-6">
                          {/* Left side - Coffee info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-display text-2xl text-paper group-hover:text-amber transition-colors truncate">
                                {(coffee?.name || "CAFÉ DESCONOCIDO").toUpperCase()}
                              </h3>
                              {brew.rating && (
                                <BrutalistRating rating={brew.rating} />
                              )}
                            </div>
                            <div className="flex items-center gap-3 font-mono text-xs text-stone">
                              <span>{coffee?.roaster || "—"}</span>
                              {brewer && (
                                <>
                                  <span className="text-amber">/</span>
                                  <span className="text-paper/60">{brewer.name}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right side - Parameters */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-sm bg-charred px-3 py-1.5 border border-concrete-light text-paper">
                                {brew.dose_g}g : {brew.water_g}g
                              </span>
                              {brewWithRatio.ratio && (
                                <span className="brutalist-badge">
                                  {brewWithRatio.ratio}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[10px] text-stone uppercase tracking-wider">
                              {formatBrewTime(brew.total_time_s)} · {brewTime}
                            </p>
                          </div>
                        </div>

                        {/* Tasting notes and feedback */}
                        {(brew.tasting_notes?.length > 0 || brew.feedback) && (
                          <div className="mt-5 pt-5 border-t border-concrete-light">
                            {brew.tasting_notes && brew.tasting_notes.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {brew.tasting_notes.map((note: string, i: number) => (
                                  <span key={i} className="brutalist-tag text-xs">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            )}
                            {brew.feedback && (
                              <p className="font-body text-sm text-amber italic">
                                "{brew.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Goal if defined */}
                        {brew.goal && (
                          <div className="mt-4 flex items-center gap-3">
                            <span className="w-2 h-2 bg-crema" />
                            <span className="font-mono text-xs text-stone uppercase tracking-wider">
                              Objetivo: {brew.goal}
                            </span>
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
        /* Empty state */
        <div className="brutalist-card p-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-charred border-2 border-concrete-light mb-8">
            <span className="font-display text-5xl text-amber opacity-30">B</span>
          </div>
          <p className="font-display text-2xl text-paper mb-2">
            SIN PREPARACIONES
          </p>
          <p className="font-body text-stone italic mb-8">
            Tu primera taza espera ser documentada
          </p>
          <Link href="/brews/new" className="btn-brutalist">
            <span className="btn-brutalist-plus">+</span>
            PRIMERA PREPARACIÓN
          </Link>
        </div>
      )}

      {/* Footer */}
      {brews && brews.length > 0 && (
        <div className="divider-brutalist">
          <span className="divider-brutalist-text">
            {brews.length} preparaciones documentadas
          </span>
        </div>
      )}
    </div>
  );
}
