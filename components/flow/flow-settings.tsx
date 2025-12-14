"use client";

import { useState } from "react";
import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";
import { calculateRatio } from "@/lib/utils/brew-calculations";

export function FlowSettings() {
  const { state, updateSettings, nextPhase, prevPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);

  // Local state for text inputs (allows empty string while typing)
  const [doseText, setDoseText] = useState(state.doseG.toString());
  const [waterText, setWaterText] = useState(state.waterG.toString());
  const [grindText, setGrindText] = useState(state.grindSetting?.toString() || "");

  const ratio = calculateRatio(
    parseFloat(doseText) || 0,
    parseFloat(waterText) || 0
  );

  const handleDoseChange = (value: string) => {
    setDoseText(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      updateSettings({ doseG: num });
    }
  };

  const handleWaterChange = (value: string) => {
    setWaterText(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      updateSettings({ waterG: num });
    }
  };

  const handleGrindChange = (value: string) => {
    setGrindText(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      updateSettings({ grindSetting: num });
    } else if (value === "") {
      updateSettings({ grindSetting: null });
    }
  };

  // Restore valid value on blur if empty
  const handleDoseBlur = () => {
    const num = parseFloat(doseText);
    if (isNaN(num) || num <= 0) {
      setDoseText(state.doseG.toString());
    }
  };

  const handleWaterBlur = () => {
    const num = parseFloat(waterText);
    if (isNaN(num) || num <= 0) {
      setWaterText(state.waterG.toString());
    }
  };

  return (
    <div className="flow-content min-h-screen py-20">
      {/* Header */}
      <div className="mb-10 flow-enter">
        <h2
          className={`flow-display flow-text-title mb-2 ${
            isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]"
          }`}
        >
          Parámetros
        </h2>
        <p
          className={`flow-display-light flow-text-body ${
            isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
          }`}
        >
          Configura tu receta
        </p>
      </div>

      {/* Settings */}
      <div className="w-full max-w-md space-y-8 mb-10">
        {/* Dose & Water */}
        <div className="flow-enter">
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Dose */}
            <div className="text-center">
              <label
                className={`block text-sm mb-2 ${
                  isDark
                    ? "text-[var(--flow-text-secondary)]"
                    : "text-[var(--flow-text-dark-secondary)]"
                }`}
              >
                Café (g)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={doseText}
                onChange={(e) => handleDoseChange(e.target.value)}
                onBlur={handleDoseBlur}
                className={`flow-input ${isDark ? "" : "flow-input-dark"}`}
              />
            </div>

            {/* Ratio display */}
            <div className="text-center pt-6">
              <span
                className={`flow-mono text-2xl ${
                  isDark
                    ? "text-[var(--flow-text-primary)]"
                    : "text-[var(--flow-text-dark-primary)]"
                }`}
              >
                {ratio || "1:??"}
              </span>
            </div>

            {/* Water */}
            <div className="text-center">
              <label
                className={`block text-sm mb-2 ${
                  isDark
                    ? "text-[var(--flow-text-secondary)]"
                    : "text-[var(--flow-text-dark-secondary)]"
                }`}
              >
                Agua (g)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={waterText}
                onChange={(e) => handleWaterChange(e.target.value)}
                onBlur={handleWaterBlur}
                className={`flow-input ${isDark ? "" : "flow-input-dark"}`}
              />
            </div>
          </div>
        </div>

        {/* Grind setting */}
        <div className="flow-enter" style={{ animationDelay: "50ms" }}>
          <label
            className={`block text-sm mb-3 text-center ${
              isDark
                ? "text-[var(--flow-text-secondary)]"
                : "text-[var(--flow-text-dark-secondary)]"
            }`}
          >
            Molienda (opcional)
          </label>
          <div className="flex justify-center">
            <input
              type="text"
              inputMode="decimal"
              value={grindText}
              onChange={(e) => handleGrindChange(e.target.value)}
              placeholder="ej: 24"
              className={`flow-input ${isDark ? "" : "flow-input-dark"}`}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 flow-enter" style={{ animationDelay: "100ms" }}>
        <button
          onClick={prevPhase}
          className={`flow-btn-primary ${isDark ? "" : "flow-btn-dark"} opacity-60 hover:opacity-100`}
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

        <button
          onClick={nextPhase}
          className={`flow-btn-primary ${isDark ? "" : "flow-btn-dark"}`}
        >
          Siguiente
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
      </div>
    </div>
  );
}
