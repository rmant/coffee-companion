"use client";

import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";

// Brewer type icons
const brewerIcons: Record<string, React.ReactNode> = {
  v60: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M8 8l4 20h8l4-20H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 8h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="16" cy="28" rx="4" ry="1" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  chemex: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M10 4l2 12-2 12h12l-2-12 2-12H10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="13" width="4" height="6" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  origami: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 8l6 20h8l6-20H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 8l3 20M22 8l-3 20M16 8v20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  aeropress: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="10" y="6" width="12" height="20" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v-2h8v2" stroke="currentColor" strokeWidth="2" />
      <path d="M13 26v2h6v-2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 12h8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  ),
  kalita: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M8 8h16l-2 18H10L8 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="16" cy="8" rx="8" ry="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20h8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  ),
  other: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M16 10v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function FlowBrewerSelect() {
  const { state, selectBrewer, nextPhase, prevPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);

  const handleSelect = (brewerId: string) => {
    selectBrewer(brewerId);
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
          Elige tu Cafetera
        </h2>
        <p
          className={`flow-display-light flow-text-body ${
            isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
          }`}
        >
          ¿Con qué método prepararás?
        </p>
      </div>

      {/* Brewer cards */}
      <div className="w-full max-w-lg space-y-3 mb-8">
        {state.brewers.length === 0 ? (
          <div
            className={`flow-card ${isDark ? "" : "flow-card-dark"} text-center py-8`}
          >
            <p className={isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"}>
              No hay cafeteras registradas
            </p>
            <p className={`text-sm mt-2 ${isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"}`}>
              Agrega una cafetera primero
            </p>
          </div>
        ) : (
          state.brewers.map((brewer, index) => {
            const isSelected = state.brewerId === brewer.id;
            const icon = brewerIcons[brewer.type] || brewerIcons.other;

            return (
              <button
                key={brewer.id}
                onClick={() => handleSelect(brewer.id)}
                className={`flow-card ${isDark ? "" : "flow-card-dark"} ${
                  isSelected ? "selected" : ""
                } w-full flow-enter`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 ${
                      isDark
                        ? "text-[var(--flow-text-secondary)]"
                        : "text-[var(--flow-text-dark-secondary)]"
                    }`}
                  >
                    {icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3
                      className={`flow-display text-xl mb-1 truncate ${
                        isDark
                          ? "text-[var(--flow-text-primary)]"
                          : "text-[var(--flow-text-dark-primary)]"
                      }`}
                    >
                      {brewer.name}
                    </h3>
                    <p
                      className={`text-sm capitalize ${
                        isDark
                          ? "text-[var(--flow-text-secondary)]"
                          : "text-[var(--flow-text-dark-secondary)]"
                      }`}
                    >
                      {brewer.type}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div className="flex-shrink-0">
                    {brewer.default_dose_g && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full mr-2 ${
                          isDark
                            ? "bg-white/10 text-[var(--flow-text-muted)]"
                            : "bg-[#3c2415]/10 text-[var(--flow-text-dark-muted)]"
                        }`}
                      >
                        {brewer.default_dose_g}g
                      </span>
                    )}
                    {isSelected && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`inline-block ${
                          isDark
                            ? "text-[var(--flow-text-primary)]"
                            : "text-[var(--terracotta)]"
                        }`}
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
