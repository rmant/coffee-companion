"use client";

import { FlowTimer } from "./flow-timer";
import { useFlow } from "./flow-provider";

interface FlowDrawdownProps {
  elapsed: number;
  onComplete: () => void;
}

export function FlowDrawdown({ elapsed, onComplete }: FlowDrawdownProps) {
  const { state } = useFlow();

  return (
    <div className="flow-content min-h-screen">
      {/* Instruction */}
      <div className="mb-8 flow-enter">
        <h2 className="flow-display flow-text-title mb-2 text-[var(--flow-text-primary)]">
          Drawdown
        </h2>
        <p className="flow-display-light flow-text-subtitle text-[var(--flow-text-secondary)] flow-breathe">
          Deja que el agua filtre...
        </p>
      </div>

      {/* Timer */}
      <div className="mb-8 flow-enter" style={{ animationDelay: "100ms" }}>
        <FlowTimer elapsed={elapsed} size={300} showProgress={false} />
      </div>

      {/* Summary */}
      <div
        className="flex items-center gap-6 mb-10 flow-enter"
        style={{ animationDelay: "150ms" }}
      >
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Café</p>
          <p className="flow-mono text-xl text-[var(--flow-text-primary)]">
            {state.doseG}g
          </p>
        </div>
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Agua</p>
          <p className="flow-mono text-xl text-[var(--flow-text-primary)]">
            {state.waterG}g
          </p>
        </div>
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Vertidos</p>
          <p className="flow-mono text-xl text-[var(--flow-text-primary)]">
            {state.pourCount}
          </p>
        </div>
      </div>

      {/* Visual - dripping animation */}
      <div
        className="mb-10 flow-enter"
        style={{ animationDelay: "200ms" }}
      >
        <DrippingAnimation />
      </div>

      {/* Finish button */}
      <button
        onClick={onComplete}
        className="flow-btn-primary flow-enter"
        style={{ animationDelay: "250ms" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Preparación Completa
      </button>

      {/* Tip */}
      <p
        className="mt-6 text-xs text-[var(--flow-text-muted)] max-w-xs text-center flow-enter"
        style={{ animationDelay: "300ms" }}
      >
        Tiempo ideal de drawdown: 2:30 - 3:30 para la mayoría de recetas V60
      </p>
    </div>
  );
}

function DrippingAnimation() {
  return (
    <div className="relative w-20 h-24">
      {/* Dripper */}
      <svg
        viewBox="0 0 80 60"
        className="w-full text-[var(--flow-text-secondary)] opacity-40"
      >
        <path
          d="M10 5 L30 55 L50 55 L70 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Drips */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-3 rounded-full bg-[var(--flow-text-secondary)]"
            style={{
              opacity: 0.6 - i * 0.15,
              animation: `flow-steam 1.5s ease-in-out infinite`,
              animationDelay: `${i * 400}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
