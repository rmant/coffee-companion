"use client";

import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";

export function FlowWelcome() {
  const { state, nextPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);

  return (
    <div className="flow-content min-h-screen">
      {/* Steam animation */}
      <div className="relative mb-8">
        <SteamAnimation />
        <CoffeeCupIcon />
      </div>

      {/* Title */}
      <h1
        className={`flow-display flow-text-hero mb-4 flow-enter ${
          isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]"
        }`}
      >
        Comienza tu Preparación
      </h1>

      {/* Subtitle */}
      <p
        className={`flow-display-light flow-text-subtitle mb-12 max-w-md flow-enter ${
          isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
        }`}
        style={{ animationDelay: "100ms" }}
      >
        Te guiaremos paso a paso para lograr la taza perfecta
      </p>

      {/* Start button */}
      <button
        onClick={nextPhase}
        className={`flow-btn-primary flow-enter ${isDark ? "" : "flow-btn-dark"}`}
        style={{ animationDelay: "200ms" }}
      >
        <span>Comenzar</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="opacity-80"
        >
          <path
            d="M7 4l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function CoffeeCupIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      className="text-[var(--flow-text-dark-primary)] opacity-20"
    >
      <path
        d="M20 40h60v50a15 15 0 01-15 15H35a15 15 0 01-15-15V40z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M20 40h60v50a15 15 0 01-15 15H35a15 15 0 01-15-15V40z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 48h8a12 12 0 010 24h-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SteamAnimation() {
  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-8 rounded-full bg-[var(--flow-text-dark-muted)] opacity-40"
          style={{
            animation: "flow-steam 2s ease-in-out infinite",
            animationDelay: `${i * 300}ms`,
          }}
        />
      ))}
    </div>
  );
}
