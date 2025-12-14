"use client";

import { FlowTimer } from "./flow-timer";
import { useFlow } from "./flow-provider";

interface FlowPourProps {
  pourNumber: number;
  elapsed: number;
  onComplete: () => void;
}

export function FlowPour({ pourNumber, elapsed, onComplete }: FlowPourProps) {
  const { state } = useFlow();

  // Calculate pour targets
  const remainingWater = state.waterG - state.bloomWaterG;
  const pourAmount = remainingWater / state.pourCount;
  const targetWater = Math.round(state.bloomWaterG + pourAmount * pourNumber);
  const previousTarget =
    pourNumber > 1
      ? Math.round(state.bloomWaterG + pourAmount * (pourNumber - 1))
      : state.bloomWaterG;

  const pourWater = Math.round(targetWater - previousTarget);

  // Progress indicator
  const progressDots = Array.from({ length: state.pourCount }, (_, i) => i + 1);

  return (
    <div className="flow-content min-h-screen">
      {/* Progress dots */}
      <div className="flex gap-2 mb-6 flow-enter">
        {progressDots.map((dot) => (
          <div
            key={dot}
            className={`w-3 h-3 rounded-full transition-all ${
              dot < pourNumber
                ? "bg-white/60"
                : dot === pourNumber
                ? "bg-white scale-125"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Instruction */}
      <div className="mb-8 flow-enter">
        <h2 className="flow-display flow-text-title mb-2 text-[var(--flow-text-primary)]">
          Vertido {pourNumber}
        </h2>
        <p className="flow-display-light flow-text-subtitle text-[var(--flow-text-secondary)]">
          Vierte hasta alcanzar{" "}
          <span className="flow-mono text-[var(--flow-text-primary)]">
            {targetWater}g
          </span>
        </p>
      </div>

      {/* Timer */}
      <div className="mb-8 flow-enter" style={{ animationDelay: "100ms" }}>
        <FlowTimer elapsed={elapsed} size={300} showProgress={false} />
      </div>

      {/* Pour details */}
      <div
        className="flex items-center gap-4 mb-10 flow-enter"
        style={{ animationDelay: "150ms" }}
      >
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Añadir</p>
          <p className="flow-mono text-2xl text-[var(--flow-text-primary)]">
            +{pourWater}g
          </p>
        </div>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[var(--flow-text-muted)]"
        >
          <path
            d="M5 12h14M13 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Total</p>
          <p className="flow-mono text-2xl text-[var(--flow-text-primary)]">
            {targetWater}g
          </p>
        </div>
      </div>

      {/* Pour technique tip */}
      <div
        className="mb-8 max-w-xs text-center flow-enter"
        style={{ animationDelay: "200ms" }}
      >
        <p className="text-sm text-[var(--flow-text-secondary)] flow-breathe">
          {pourNumber === 1
            ? "Vierte en círculos concéntricos desde el centro"
            : pourNumber === state.pourCount
            ? "Último vertido — llega hasta el borde"
            : "Mantén un flujo constante y controlado"}
        </p>
      </div>

      {/* Continue button */}
      <button
        onClick={onComplete}
        className="flow-btn-primary flow-enter"
        style={{ animationDelay: "250ms" }}
      >
        {pourNumber < state.pourCount ? "Siguiente Vertido" : "Iniciar Drawdown"}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M7 4l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Visual guide */}
      <div
        className="mt-8 relative w-32 h-32 flow-enter"
        style={{ animationDelay: "300ms" }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[var(--flow-text-muted)] opacity-30"
        >
          {/* Dripper outline */}
          <path
            d="M20 20 L40 80 L60 80 L80 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Spiral pour pattern */}
          <path
            d="M50 35 Q60 35 60 45 Q60 55 50 55 Q40 55 40 45 Q40 38 50 38"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 2"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}
