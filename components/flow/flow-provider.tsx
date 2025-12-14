"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type { FlowPhase } from "./flow-gradient";

// Types
export interface Coffee {
  id: string;
  name: string;
  roaster: string;
  origin?: string | null;
  roast_date?: string | null;
  flavor_notes?: string[] | null;
}

export interface Brewer {
  id: string;
  name: string;
  type: string;
  default_dose_g?: number | null;
  default_ratio?: string | null;
}

export interface FlowState {
  phase: FlowPhase;

  // Data
  coffees: Coffee[];
  brewers: Brewer[];

  // Selections
  coffeeId: string | null;
  brewerId: string | null;

  // Settings
  doseG: number;
  waterG: number;
  grindSetting: number | null;
  waterTempC: number | null;
  bloomWaterG: number;
  bloomTimeS: number;
  pourCount: number;

  // Timer state (managed separately via hook, but tracked here)
  timerStarted: boolean;
  elapsedSeconds: number;

  // Pour tracking
  currentPourIndex: number;
  pourTargets: number[]; // Water targets for each pour

  // Results
  totalTimeS: number | null;
  rating: number | null;
  tastingNotes: string;
  feedback: string;

  // UI State
  isSubmitting: boolean;
  error: string | null;
}

// Actions
type FlowAction =
  | { type: "SET_DATA"; coffees: Coffee[]; brewers: Brewer[] }
  | { type: "SET_PHASE"; phase: FlowPhase }
  | { type: "SELECT_COFFEE"; coffeeId: string }
  | { type: "SELECT_BREWER"; brewerId: string }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Pick<FlowState, "doseG" | "waterG" | "grindSetting" | "waterTempC" | "bloomWaterG" | "bloomTimeS" | "pourCount">> }
  | { type: "START_TIMER" }
  | { type: "UPDATE_ELAPSED"; seconds: number }
  | { type: "ADVANCE_POUR" }
  | { type: "SET_TOTAL_TIME"; seconds: number }
  | { type: "SET_RATING"; rating: number | null }
  | { type: "SET_TASTING_NOTES"; notes: string }
  | { type: "SET_FEEDBACK"; feedback: string }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

// Initial state
const initialState: FlowState = {
  phase: "welcome",
  coffees: [],
  brewers: [],
  coffeeId: null,
  brewerId: null,
  doseG: 15,
  waterG: 250,
  grindSetting: null,
  waterTempC: 93,
  bloomWaterG: 30,
  bloomTimeS: 45,
  pourCount: 3,
  timerStarted: false,
  elapsedSeconds: 0,
  currentPourIndex: 0,
  pourTargets: [],
  totalTimeS: null,
  rating: null,
  tastingNotes: "",
  feedback: "",
  isSubmitting: false,
  error: null,
};

// Calculate pour targets based on settings
function calculatePourTargets(waterG: number, bloomWaterG: number, pourCount: number): number[] {
  const remainingWater = waterG - bloomWaterG;
  const pourAmount = remainingWater / pourCount;

  const targets: number[] = [];
  for (let i = 1; i <= pourCount; i++) {
    targets.push(Math.round(bloomWaterG + pourAmount * i));
  }
  return targets;
}

// Reducer
function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        coffees: action.coffees,
        brewers: action.brewers,
      };

    case "SET_PHASE":
      return {
        ...state,
        phase: action.phase,
      };

    case "SELECT_COFFEE":
      return {
        ...state,
        coffeeId: action.coffeeId,
      };

    case "SELECT_BREWER": {
      const brewer = state.brewers.find((b) => b.id === action.brewerId);
      return {
        ...state,
        brewerId: action.brewerId,
        // Apply brewer defaults if available
        doseG: brewer?.default_dose_g ?? state.doseG,
      };
    }

    case "UPDATE_SETTINGS": {
      const newState = {
        ...state,
        ...action.settings,
      };
      // Recalculate pour targets when relevant settings change
      if (action.settings.waterG || action.settings.bloomWaterG || action.settings.pourCount) {
        newState.pourTargets = calculatePourTargets(
          newState.waterG,
          newState.bloomWaterG,
          newState.pourCount
        );
      }
      return newState;
    }

    case "START_TIMER":
      return {
        ...state,
        timerStarted: true,
        pourTargets: calculatePourTargets(state.waterG, state.bloomWaterG, state.pourCount),
      };

    case "UPDATE_ELAPSED":
      return {
        ...state,
        elapsedSeconds: action.seconds,
      };

    case "ADVANCE_POUR":
      return {
        ...state,
        currentPourIndex: state.currentPourIndex + 1,
      };

    case "SET_TOTAL_TIME":
      return {
        ...state,
        totalTimeS: action.seconds,
      };

    case "SET_RATING":
      return {
        ...state,
        rating: action.rating,
      };

    case "SET_TASTING_NOTES":
      return {
        ...state,
        tastingNotes: action.notes,
      };

    case "SET_FEEDBACK":
      return {
        ...state,
        feedback: action.feedback,
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };

    case "RESET":
      return {
        ...initialState,
        coffees: state.coffees,
        brewers: state.brewers,
      };

    default:
      return state;
  }
}

// Context
interface FlowContextValue {
  state: FlowState;
  dispatch: Dispatch<FlowAction>;

  // Convenience methods
  nextPhase: () => void;
  prevPhase: () => void;
  goToPhase: (phase: FlowPhase) => void;
  selectCoffee: (id: string) => void;
  selectBrewer: (id: string) => void;
  updateSettings: (settings: Partial<Pick<FlowState, "doseG" | "waterG" | "grindSetting" | "waterTempC" | "bloomWaterG" | "bloomTimeS" | "pourCount">>) => void;
  startTimer: () => void;
  advancePour: () => void;
  setRating: (rating: number | null) => void;
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

// Phase navigation order (simplified - no timer phases)
const phaseOrder: FlowPhase[] = [
  "welcome",
  "coffee",
  "brewer",
  "settings",
  "results",
];

function getNextPhase(current: FlowPhase): FlowPhase {
  const currentIndex = phaseOrder.indexOf(current);
  if (currentIndex === -1 || currentIndex >= phaseOrder.length - 1) {
    return current;
  }
  return phaseOrder[currentIndex + 1];
}

function getPrevPhase(current: FlowPhase): FlowPhase {
  const currentIndex = phaseOrder.indexOf(current);
  if (currentIndex <= 0) {
    return current;
  }
  return phaseOrder[currentIndex - 1];
}

// Provider
interface FlowProviderProps {
  children: ReactNode;
  coffees: Coffee[];
  brewers: Brewer[];
}

export function FlowProvider({ children, coffees, brewers }: FlowProviderProps) {
  const [state, dispatch] = useReducer(flowReducer, {
    ...initialState,
    coffees,
    brewers,
  });

  const nextPhase = useCallback(() => {
    const next = getNextPhase(state.phase);
    dispatch({ type: "SET_PHASE", phase: next });
  }, [state.phase]);

  const prevPhase = useCallback(() => {
    const prev = getPrevPhase(state.phase);
    dispatch({ type: "SET_PHASE", phase: prev });
  }, [state.phase]);

  const goToPhase = useCallback((phase: FlowPhase) => {
    dispatch({ type: "SET_PHASE", phase });
  }, []);

  const selectCoffee = useCallback((id: string) => {
    dispatch({ type: "SELECT_COFFEE", coffeeId: id });
  }, []);

  const selectBrewer = useCallback((id: string) => {
    dispatch({ type: "SELECT_BREWER", brewerId: id });
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<Pick<FlowState, "doseG" | "waterG" | "grindSetting" | "waterTempC" | "bloomWaterG" | "bloomTimeS" | "pourCount">>) => {
      dispatch({ type: "UPDATE_SETTINGS", settings });
    },
    []
  );

  const startTimer = useCallback(() => {
    dispatch({ type: "START_TIMER" });
  }, []);

  const advancePour = useCallback(() => {
    dispatch({ type: "ADVANCE_POUR" });
  }, []);

  const setRating = useCallback((rating: number | null) => {
    dispatch({ type: "SET_RATING", rating });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: FlowContextValue = {
    state,
    dispatch,
    nextPhase,
    prevPhase,
    goToPhase,
    selectCoffee,
    selectBrewer,
    updateSettings,
    startTimer,
    advancePour,
    setRating,
    reset,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

// Hook
export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
}
