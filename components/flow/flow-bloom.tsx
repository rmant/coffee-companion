"use client";

import { useEffect } from "react";
import { FlowTimer } from "./flow-timer";
import { useFlow } from "./flow-provider";
import { useBrewTimer } from "@/lib/hooks/use-brew-timer";

interface FlowBloomProps {
  onComplete: (elapsedSeconds: number) => void;
}

export function FlowBloom({ onComplete }: FlowBloomProps) {
  const { state, dispatch } = useFlow();

  const { elapsed, isRunning, start, formatTime } = useBrewTimer({
    targetSeconds: state.bloomTimeS,
    onTick: (seconds) => {
      dispatch({ type: "UPDATE_ELAPSED", seconds });
    },
  });

  // Auto-start timer when component mounts
  useEffect(() => {
    if (!isRunning) {
      start();
    }
  }, [isRunning, start]);

  const handleContinue = () => {
    onComplete(elapsed);
  };

  const isBloomComplete = elapsed >= state.bloomTimeS;

  return (
    <div className="flow-content min-h-screen">
      {/* Instruction */}
      <div className="mb-8 flow-enter">
        <h2 className="flow-display flow-text-title mb-2 text-[var(--flow-text-primary)]">
          Bloom
        </h2>
        <p className="flow-display-light flow-text-subtitle text-[var(--flow-text-secondary)] flow-breathe">
          Vierte {state.bloomWaterG}g de agua
        </p>
      </div>

      {/* Timer */}
      <div className="mb-8 flow-enter" style={{ animationDelay: "100ms" }}>
        <FlowTimer
          elapsed={elapsed}
          target={state.bloomTimeS}
          size={300}
          showProgress={true}
        />
      </div>

      {/* Status */}
      <div
        className="mb-8 text-center flow-enter"
        style={{ animationDelay: "200ms" }}
      >
        {!isBloomComplete ? (
          <p className="text-[var(--flow-text-secondary)] flow-breathe">
            Deja que el café florezca...
          </p>
        ) : (
          <p className="text-[var(--flow-text-primary)]">
            ¡Bloom completo! Continúa cuando estés listo.
          </p>
        )}
      </div>

      {/* Target display */}
      <div
        className="flex items-center gap-4 mb-10 flow-enter"
        style={{ animationDelay: "150ms" }}
      >
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Objetivo</p>
          <p className="flow-mono text-2xl text-[var(--flow-text-primary)]">
            {state.bloomWaterG}g
          </p>
        </div>
        <div className="text-center px-6 py-3 rounded-xl bg-white/10">
          <p className="text-xs text-[var(--flow-text-muted)] mb-1">Tiempo</p>
          <p className="flow-mono text-2xl text-[var(--flow-text-primary)]">
            {formatTime(state.bloomTimeS)}
          </p>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        className={`flow-btn-primary flow-enter ${
          !isBloomComplete ? "opacity-60" : ""
        }`}
        style={{ animationDelay: "300ms" }}
      >
        {isBloomComplete ? "Siguiente Vertido" : "Continuar de Todos Modos"}
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

      {/* Tip */}
      <p
        className="mt-6 text-xs text-[var(--flow-text-muted)] max-w-xs text-center flow-enter"
        style={{ animationDelay: "350ms" }}
      >
        Tip: Mueve suavemente para asegurar que todo el café esté saturado
      </p>
    </div>
  );
}
