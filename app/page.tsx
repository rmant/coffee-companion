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
      .limit(5),
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
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section - Start Brew CTA */}
      <section className="flex-1 flex flex-col items-center justify-center py-16 relative">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, #3c2415 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Coffee cup icon with steam */}
        <div className="relative mb-8">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 opacity-40">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-6 rounded-full bg-[#3c2415]"
                style={{
                  animation: "flow-steam 2s ease-in-out infinite",
                  animationDelay: `${i * 300}ms`,
                }}
              />
            ))}
          </div>
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            className="text-[#3c2415]"
          >
            <path
              d="M15 30h50v45a12 12 0 01-12 12H27a12 12 0 01-12-12V30z"
              fill="currentColor"
              opacity="0.1"
            />
            <path
              d="M15 30h50v45a12 12 0 01-12 12H27a12 12 0 01-12-12V30z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M65 38h8a10 10 0 010 20h-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Main heading */}
        <h1
          className="flow-display text-5xl md:text-6xl text-[#3c2415] mb-4 text-center"
        >
          Coffee Companion
        </h1>

        {/* Tagline */}
        <p
          className="flow-display-light text-xl text-[#5a3d2b] mb-10 text-center max-w-md"
        >
          Tu guía personal para la preparación perfecta
        </p>

        {/* Start Brew button */}
        <Link
          href="/brews/new"
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-[#3c2415] text-[#faf6f0] rounded-full text-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-100"
          style={{
            boxShadow: "0 8px 30px rgba(60, 36, 21, 0.3)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="group-hover:rotate-90 transition-transform duration-300"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="flow-display">Comenzar Preparación</span>
        </Link>

        {/* Quick stats */}
        <div className="flex items-center gap-8 mt-12 text-center">
          <div>
            <p className="flow-mono text-3xl text-[#3c2415]">
              {totalBrewCount || 0}
            </p>
            <p className="text-sm text-[#5a3d2b] mt-1">preparaciones</p>
          </div>
          <div className="w-px h-10 bg-[#3c2415] opacity-20" />
          <div>
            <p className="flow-mono text-3xl text-[#3c2415]">
              {activeCoffeeCount || 0}
            </p>
            <p className="text-sm text-[#5a3d2b] mt-1">cafés activos</p>
          </div>
          {streak > 0 && (
            <>
              <div className="w-px h-10 bg-[#3c2415] opacity-20" />
              <div>
                <p className="flow-mono text-3xl text-[#c45c3e]">
                  {streak}
                </p>
                <p className="text-sm text-[#5a3d2b] mt-1">días seguidos</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recent Brews Section */}
      {recentBrews && recentBrews.length > 0 && (
        <section className="py-12 border-t border-[#3c2415]/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flow-display text-2xl text-[#3c2415]">
              Preparaciones Recientes
            </h2>
            <Link
              href="/brews"
              className="text-sm text-[#c45c3e] hover:text-[#3c2415] transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                  className="group flex items-center gap-4 p-4 rounded-xl border border-[#3c2415]/10 hover:border-[#c45c3e]/40 hover:bg-[#faf6f0] transition-all"
                >
                  {/* Rating or placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f0ebe3] flex items-center justify-center">
                    {brew.rating ? (
                      <span className="flow-mono text-lg text-[#3c2415]">
                        {brew.rating}
                      </span>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#8a7a6a]"
                      >
                        <path
                          d="M6 10h12v10a2 2 0 01-2 2H8a2 2 0 01-2-2V10z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 12h1a3 3 0 010 6h-1"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#3c2415] truncate group-hover:text-[#c45c3e] transition-colors">
                      {coffee?.name || "Café"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[#8a7a6a]">
                      <span className="flow-mono">
                        {brew.dose_g}g · {formatBrewTime(brew.total_time_s)}
                      </span>
                      {brewWithRatio.ratio && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#f0ebe3]">
                          {brewWithRatio.ratio}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-[#8a7a6a]">
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
        <section className="py-12 border-t border-[#3c2415]/10 text-center">
          <p className="text-[#8a7a6a] mb-2">
            Aún no tienes preparaciones registradas
          </p>
          <p className="flow-display-light text-[#c45c3e]">
            ¡Comienza tu viaje cafetero ahora!
          </p>
        </section>
      )}

      {/* Quick links */}
      <section className="py-8 flex justify-center gap-8 text-sm">
        <Link
          href="/coffees"
          className="text-[#5a3d2b] hover:text-[#c45c3e] transition-colors"
        >
          Mis Cafés
        </Link>
        <Link
          href="/brewers"
          className="text-[#5a3d2b] hover:text-[#c45c3e] transition-colors"
        >
          Mis Cafeteras
        </Link>
        <Link
          href="/brews"
          className="text-[#5a3d2b] hover:text-[#c45c3e] transition-colors"
        >
          Historial
        </Link>
      </section>
    </div>
  );
}
