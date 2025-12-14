"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlowGradient } from "./flow-gradient";
import { FlowProvider, useFlow } from "./flow-provider";
import { FlowWelcome } from "./flow-welcome";
import { FlowCoffeeSelect } from "./flow-coffee-select";
import { FlowBrewerSelect } from "./flow-brewer-select";
import { FlowSettings } from "./flow-settings";
import { FlowResults } from "./flow-results";

interface FlowContainerInnerProps {
  onExit: () => void;
}

function FlowContainerInner({ onExit }: FlowContainerInnerProps) {
  const { state } = useFlow();

  // Render current phase
  const renderPhase = () => {
    switch (state.phase) {
      case "welcome":
        return <FlowWelcome />;

      case "coffee":
        return <FlowCoffeeSelect />;

      case "brewer":
        return <FlowBrewerSelect />;

      case "settings":
        return <FlowSettings />;

      case "results":
        return <FlowResults />;

      default:
        return <FlowWelcome />;
    }
  };

  return (
    <div className="flow-container">
      {/* Gradient background */}
      <FlowGradient phase={state.phase} />

      {/* Exit button */}
      <button
        onClick={onExit}
        className="flow-exit-btn"
        aria-label="Salir"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Phase content */}
      {renderPhase()}
    </div>
  );
}

interface FlowContainerProps {
  coffees: Array<{
    id: string;
    name: string;
    roaster: string;
    origin?: string | null;
    roast_date?: string | null;
    flavor_notes?: string[] | null;
  }>;
  brewers: Array<{
    id: string;
    name: string;
    type: string;
    default_dose_g?: number | null;
    default_ratio?: string | null;
  }>;
}

export function FlowContainer({ coffees, brewers }: FlowContainerProps) {
  const router = useRouter();

  const handleExit = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <FlowProvider coffees={coffees} brewers={brewers}>
      <FlowContainerInner onExit={handleExit} />
    </FlowProvider>
  );
}
