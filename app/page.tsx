import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { withRatio, formatBrewTime } from "@/lib/utils/brew-calculations";

export default async function HomePage() {
  const supabase = await createClient();

  // Get counts and recent data
  const [
    { count: totalBrewCount },
    { data: recentBrews },
    { count: activeCoffeeCount },
  ] = await Promise.all([
    supabase.from("brews").select("*", { count: "exact", head: true }),
    supabase
      .from("brews")
      .select("*, coffees(name, roaster)")
      .order("brewed_at", { ascending: false })
      .limit(6),
    supabase
      .from("coffees")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  // Calculate streak (consecutive days with brews)
  const calculateStreak = () => {
    if (!recentBrews || recentBrews.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasBrewOnDate = recentBrews.some((brew) => {
        const brewDate = new Date(brew.brewed_at);
        brewDate.setHours(0, 0, 0, 0);
        return brewDate.getTime() === checkDate.getTime();
      });

      if (hasBrewOnDate) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="min-h-[85vh] flex flex-col">
      {/* Hero Section - Brutalist */}
      <section className="flex-1 flex items-center py-16 relative">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-amber to-transparent" />
          <div className="absolute top-0 left-[80%] w-px h-full bg-gradient-to-b from-transparent via-concrete-light to-transparent" />
          <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-amber to-transparent" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left column - Typography hero */}
          <div className="stagger-children">
            {/* Small label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-xs tracking-[0.3em] text-stone uppercase">
                Pour-Over Journal
              </span>
              <span className="w-12 h-px bg-amber" />
            </div>

            {/* Main headline */}
            <h1 className="font-display text-7xl md:text-8xl lg:text-9xl text-paper leading-[0.85] mb-6">
              <span className="block text-amber">FILTRADO</span>
            </h1>

            {/* Tagline */}
            <p className="font-body text-xl text-stone italic max-w-md mb-10">
              Tu diario personal para la preparación perfecta de café especialidad
            </p>

            {/* CTA Button */}
            <Link
              href="/brews/new"
              className="btn-brutalist text-xl px-8 py-5 inline-flex"
            >
              <span className="btn-brutalist-plus text-2xl">+</span>
              NUEVA PREPARACIÓN
            </Link>
          </div>

          {/* Right column - Stats grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Total brews */}
            <div className="brutalist-card p-8">
              <div className="stat-brutalist">
                <span className="stat-number">{totalBrewCount || 0}</span>
                <span className="stat-label">Preparaciones</span>
              </div>
            </div>

            {/* Active coffees */}
            <div className="brutalist-card p-8">
              <div className="stat-brutalist">
                <span className="stat-number">{activeCoffeeCount || 0}</span>
                <span className="stat-label">Cafés Activos</span>
              </div>
            </div>

            {/* Streak */}
            <div className="brutalist-card col-span-2 p-8 flex items-center justify-between">
              <div className="stat-brutalist">
                <span className="stat-number text-crema">{streak}</span>
                <span className="stat-label">Días Seguidos</span>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-stone uppercase tracking-wider mb-1">
                  Racha Actual
                </p>
                <p className="font-body text-sm text-paper/60 italic">
                  {streak > 0 ? "¡Sigue así!" : "Comienza hoy"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-brutalist">
        <span className="divider-brutalist-text">Actividad Reciente</span>
      </div>

      {/* Recent Brews Section */}
      {recentBrews && recentBrews.length > 0 && (
        <section className="py-8">
          <div className="flex items-end justify-between mb-8">
            <div className="section-header flex-1 border-none pb-0 mb-0">
              <h2 className="section-title">PREPARACIONES</h2>
            </div>
            <Link
              href="/brews"
              className="brutalist-tag hover:bg-amber hover:text-charred"
            >
              Ver Todas →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {recentBrews.slice(0, 6).map((brew) => {
              const brewWithRatio = withRatio(brew);
              const coffee = brew.coffees as { name: string; roaster: string } | null;
              const brewDate = new Date(brew.brewed_at);
              const isToday =
                brewDate.toDateString() === new Date().toDateString();

              return (
                <Link
                  key={brew.id}
                  href={`/brews/${brew.id}`}
                  className="brutalist-card group flex items-start gap-4"
                >
                  {/* Rating badge */}
                  <div className="flex-shrink-0 w-14 h-14 bg-charred flex items-center justify-center border-2 border-concrete-light group-hover:border-amber transition-colors">
                    {brew.rating ? (
                      <span className="font-display text-2xl text-amber">
                        {brew.rating}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-stone">—</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg text-paper truncate group-hover:text-amber transition-colors">
                      {coffee?.name || "CAFÉ"}
                    </p>
                    <p className="font-body text-sm text-stone truncate mb-2">
                      {coffee?.roaster || "—"}
                    </p>
                    <div className="flex items-center gap-3 font-mono text-xs text-stone">
                      <span>{brew.dose_g}g</span>
                      <span className="text-amber">/</span>
                      <span>{formatBrewTime(brew.total_time_s)}</span>
                      {brewWithRatio.ratio && (
                        <>
                          <span className="text-amber">/</span>
                          <span className="text-paper">{brewWithRatio.ratio}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-mono text-[10px] text-stone uppercase tracking-wider">
                      {isToday
                        ? brewDate.toLocaleTimeString("es-ES", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : brewDate.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!recentBrews || recentBrews.length === 0) && (
        <section className="py-16 text-center">
          <div className="brutalist-card inline-block p-12">
            <p className="font-mono text-sm text-stone uppercase tracking-wider mb-4">
              Sin preparaciones aún
            </p>
            <p className="font-body text-xl text-paper italic mb-6">
              ¡Comienza tu viaje cafetero!
            </p>
            <Link href="/brews/new" className="btn-brutalist">
              <span className="btn-brutalist-plus">+</span>
              PRIMERA PREPARACIÓN
            </Link>
          </div>
        </section>
      )}

      {/* Quick Navigation */}
      <section className="py-10 mt-auto">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/coffees"
            className="brutalist-card p-6 text-center group"
          >
            <span className="font-display text-xl text-stone group-hover:text-amber transition-colors">
              MIS CAFÉS
            </span>
          </Link>
          <Link
            href="/brewers"
            className="brutalist-card p-6 text-center group"
          >
            <span className="font-display text-xl text-stone group-hover:text-amber transition-colors">
              MIS CAFETERAS
            </span>
          </Link>
          <Link
            href="/brews"
            className="brutalist-card p-6 text-center group"
          >
            <span className="font-display text-xl text-stone group-hover:text-amber transition-colors">
              HISTORIAL
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
