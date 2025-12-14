import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const brewerTypeConfig: Record<string, { label: string }> = {
  v60: { label: "V60" },
  chemex: { label: "CHEMEX" },
  origami: { label: "ORIGAMI" },
  aeropress: { label: "AEROPRESS" },
  kalita: { label: "KALITA" },
  other: { label: "OTHER" },
};

export default async function BrewersPage() {
  const supabase = await createClient();

  const { data: brewers } = await supabase
    .from("brewers")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="section-header">
        <div className="flex-1">
          <h1 className="section-title">CAFETERAS</h1>
          <p className="section-subtitle mt-1">Tu equipo de pour-over</p>
        </div>
        <Link href="/brewers/new" className="btn-brutalist">
          <span className="btn-brutalist-plus">+</span>
          <span className="hidden md:inline">AGREGAR</span>
        </Link>
      </section>

      {/* Brewers Grid */}
      {brewers && brewers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {brewers.map((brewer) => {
            const typeConfig = brewerTypeConfig[brewer.type] || brewerTypeConfig.other;

            return (
              <article
                key={brewer.id}
                className="brutalist-card group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="font-display text-2xl text-paper group-hover:text-amber transition-colors">
                    {brewer.name.toUpperCase()}
                  </h3>
                  <span className="brutalist-badge">
                    {typeConfig.label}
                  </span>
                </div>

                {brewer.filter_type && (
                  <div className="flex items-center gap-2 mb-4 font-mono text-xs text-stone uppercase tracking-wider">
                    <span className="text-amber">//</span>
                    Filtro: {brewer.filter_type}
                  </div>
                )}

                {(brewer.default_dose_g || brewer.default_ratio) && (
                  <div className="pt-4 border-t border-concrete-light">
                    <p className="font-mono text-xs text-stone uppercase tracking-wider mb-2">
                      VALORES POR DEFECTO
                    </p>
                    <div className="flex items-center gap-4">
                      {brewer.default_dose_g && (
                        <span className="font-display text-xl text-paper">
                          {brewer.default_dose_g}G
                        </span>
                      )}
                      {brewer.default_dose_g && brewer.default_ratio && (
                        <span className="text-amber">/</span>
                      )}
                      {brewer.default_ratio && (
                        <span className="font-display text-xl text-crema">
                          {brewer.default_ratio}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {brewer.notes && (
                  <div className="mt-4">
                    <p className="font-body text-sm text-stone italic">
                      {brewer.notes}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="brutalist-card p-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-charred border-2 border-concrete-light mb-8">
            <span className="font-display text-5xl text-amber opacity-30">V</span>
          </div>
          <p className="font-display text-2xl text-paper mb-2">
            SIN CAFETERAS
          </p>
          <p className="font-body text-stone italic mb-8">
            Agrega tu primer equipo de preparación
          </p>
          <Link href="/brewers/new" className="btn-brutalist">
            <span className="btn-brutalist-plus">+</span>
            AGREGAR CAFETERA
          </Link>
        </div>
      )}
    </div>
  );
}
