"use client";

import { useEffect, useState } from "react";
import { useFlow } from "./flow-provider";

interface FlowReadyProps {
  onComplete: () => void;
}

export function FlowReady({ onComplete }: FlowReadyProps) {
  const { state } = useFlow();
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState<"instruction" | "countdown" | "go">("instruction");

  // Get selected coffee and brewer names
  const coffee = state.coffees.find((c) => c.id === state.coffeeId);
  const brewer = state.brewers.find((b) => b.id === state.brewerId);

  const startCountdown = () => {
    setPhase("countdown");
  };

  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase("go");
      // Short delay then start brewing
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [countdown, phase, onComplete]);

  if (phase === "go") {
    return (
      <div className="flow-content min-h-screen">
        <div className="flow-countdown">
          <span className="flow-display flow-text-hero text-[var(--flow-text-primary)]">
            ¡Vamos!
          </span>
        </div>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flow-content min-h-screen">
        <div key={countdown} className="flow-countdown">
          <span className="flow-mono text-[12rem] text-[var(--flow-text-primary)] leading-none">
            {countdown}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-content min-h-screen py-20">
      {/* Summary */}
      <div className="mb-10 flow-enter">
        <h2 className="flow-display flow-text-title mb-2 text-[var(--flow-text-primary)]">
          Todo Listo
        </h2>
        <p className="flow-display-light flow-text-body text-[var(--flow-text-secondary)]">
          Prepara tu equipo
        </p>
      </div>

      {/* Recipe card */}
      <div
        className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-10 flow-enter"
        style={{ animationDelay: "100ms" }}
      >
        <div className="space-y-4">
          {/* Coffee */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--flow-text-secondary)]">
                <ellipse cx="12" cy="12" rx="6" ry="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 4c-1 2-1 6 0 8s1 6 0 8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--flow-text-primary)] font-medium">{coffee?.name}</p>
              <p className="text-sm text-[var(--flow-text-secondary)]">{coffee?.roaster}</p>
            </div>
          </div>

          {/* Brewer */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--flow-text-secondary)]">
                <path d="M6 6l3 14h6l3-14H6z" stroke="currentColor" strokeWidth="2" />
                <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--flow-text-primary)] font-medium">{brewer?.name}</p>
              <p className="text-sm text-[var(--flow-text-secondary)] capitalize">{brewer?.type}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Recipe */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl flow-mono text-[var(--flow-text-primary)]">{state.doseG}g</p>
              <p className="text-xs text-[var(--flow-text-muted)]">Café</p>
            </div>
            <div>
              <p className="text-2xl flow-mono text-[var(--flow-text-primary)]">{state.waterG}g</p>
              <p className="text-xs text-[var(--flow-text-muted)]">Agua</p>
            </div>
            <div>
              <p className="text-2xl flow-mono text-[var(--flow-text-primary)]">{state.pourCount}</p>
              <p className="text-xs text-[var(--flow-text-muted)]">Vertidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div
        className="w-full max-w-sm mb-10 flow-enter"
        style={{ animationDelay: "200ms" }}
      >
        <p className="text-sm text-[var(--flow-text-secondary)] mb-4 text-center">
          Asegúrate de tener:
        </p>
        <div className="space-y-2">
          {[
            "Agua caliente lista",
            "Filtro enjuagado",
            "Café molido en el filtro",
            "Báscula a cero",
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-[var(--flow-text-secondary)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 8l2 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={startCountdown}
        className="flow-btn-primary flow-enter"
        style={{ animationDelay: "300ms" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon points="8,5 19,12 8,19" fill="currentColor" />
        </svg>
        Iniciar Preparación
      </button>
    </div>
  );
}
