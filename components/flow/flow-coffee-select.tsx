"use client";

import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";
import { calculateDaysOffRoast } from "@/lib/utils/brew-calculations";

export function FlowCoffeeSelect() {
  const { state, selectCoffee, nextPhase, prevPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);

  const handleSelect = (coffeeId: string) => {
    selectCoffee(coffeeId);
    // Auto-advance to next phase
    setTimeout(() => nextPhase(), 150);
  };

  return (
    <div className="flow-content min-h-screen py-20">
      {/* Header */}
      <div className="mb-8 flow-enter">
        <h2
          className={`flow-display flow-text-title mb-2 ${
            isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]"
          }`}
        >
          Elige tu Café
        </h2>
        <p
          className={`flow-display-light flow-text-body ${
            isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
          }`}
        >
          ¿Qué granos prepararás hoy?
        </p>
      </div>

      {/* Coffee cards */}
      <div className="w-full max-w-lg space-y-3 mb-8">
        {state.coffees.length === 0 ? (
          <div
            className={`flow-card ${isDark ? "" : "flow-card-dark"} text-center py-8`}
          >
            <p className={isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"}>
              No hay cafés activos
            </p>
            <p className={`text-sm mt-2 ${isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"}`}>
              Agrega un café primero
            </p>
          </div>
        ) : (
          state.coffees.map((coffee, index) => {
            const daysOff = coffee.roast_date
              ? calculateDaysOffRoast(coffee.roast_date)
              : null;
            const isSelected = state.coffeeId === coffee.id;

            return (
              <button
                key={coffee.id}
                onClick={() => handleSelect(coffee.id)}
                className={`flow-card ${isDark ? "" : "flow-card-dark"} ${
                  isSelected ? "selected" : ""
                } w-full flow-enter`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`flow-display text-xl mb-1 truncate ${
                        isDark
                          ? "text-[var(--flow-text-primary)]"
                          : "text-[var(--flow-text-dark-primary)]"
                      }`}
                    >
                      {coffee.name}
                    </h3>
                    <p
                      className={`text-sm truncate ${
                        isDark
                          ? "text-[var(--flow-text-secondary)]"
                          : "text-[var(--flow-text-dark-secondary)]"
                      }`}
                    >
                      {coffee.roaster}
                    </p>
                    {coffee.origin && (
                      <p
                        className={`text-xs mt-1 ${
                          isDark
                            ? "text-[var(--flow-text-muted)]"
                            : "text-[var(--flow-text-dark-muted)]"
                        }`}
                      >
                        {coffee.origin}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {daysOff !== null && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isDark
                            ? "bg-white/10 text-[var(--flow-text-secondary)]"
                            : "bg-[#3c2415]/10 text-[var(--flow-text-dark-secondary)]"
                        }`}
                      >
                        {daysOff}d
                      </span>
                    )}
                    {isSelected && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={
                          isDark
                            ? "text-[var(--flow-text-primary)]"
                            : "text-[var(--terracotta)]"
                        }
                      >
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                        <path
                          d="M8 12l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Flavor notes */}
                {coffee.flavor_notes && coffee.flavor_notes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {coffee.flavor_notes.slice(0, 3).map((note, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark
                            ? "bg-white/5 text-[var(--flow-text-muted)]"
                            : "bg-[#3c2415]/5 text-[var(--flow-text-dark-muted)]"
                        }`}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Back button */}
      <button
        onClick={prevPhase}
        className={`flow-btn-primary ${isDark ? "" : "flow-btn-dark"} opacity-60 hover:opacity-100 flow-enter`}
        style={{ animationDelay: "300ms" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M13 4l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Atrás
      </button>
    </div>
  );
}
