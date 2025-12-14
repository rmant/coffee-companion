"use client";

export type FlowPhase =
  | "welcome"
  | "coffee"
  | "brewer"
  | "settings"
  | "results"
  | "ready"
  | "bloom"
  | "pour-1"
  | "pour-2"
  | "pour-3"
  | "pour-4"
  | "pour-5"
  | "drawdown"
  | "complete";

const phaseGradients: Record<FlowPhase, string> = {
  welcome: "var(--flow-gradient-welcome)",
  coffee: "var(--flow-gradient-select)",
  brewer: "var(--flow-gradient-select)",
  settings: "var(--flow-gradient-settings)",
  results: "var(--flow-gradient-complete)",
  ready: "var(--flow-gradient-ready)",
  bloom: "var(--flow-gradient-bloom)",
  "pour-1": "var(--flow-gradient-pour-1)",
  "pour-2": "var(--flow-gradient-pour-2)",
  "pour-3": "var(--flow-gradient-pour-3)",
  "pour-4": "var(--flow-gradient-pour-4)",
  "pour-5": "var(--flow-gradient-pour-5)",
  drawdown: "var(--flow-gradient-drawdown)",
  complete: "var(--flow-gradient-complete)",
};

// Phases with dark backgrounds need light text
export const darkPhases: FlowPhase[] = [
  "bloom",
  "pour-1",
  "pour-2",
  "pour-3",
  "pour-4",
  "pour-5",
  "drawdown",
];

interface FlowGradientProps {
  phase: FlowPhase;
  className?: string;
}

export function FlowGradient({ phase, className = "" }: FlowGradientProps) {
  return (
    <div
      className={`flow-gradient ${className}`}
      style={{ background: phaseGradients[phase] }}
    />
  );
}

export function isDarkPhase(phase: FlowPhase): boolean {
  return darkPhases.includes(phase);
}
