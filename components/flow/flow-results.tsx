"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";
import { FlowParticles } from "./flow-particles";
import { parseBrewTime } from "@/lib/utils/brew-calculations";

// Taste metrics configuration
const tasteMetrics = [
  { key: "acidity", label: "Acidez", lowLabel: "Plana", highLabel: "Brillante" },
  { key: "sweetness", label: "Dulzor", lowLabel: "Sutil", highLabel: "Intenso" },
  { key: "body", label: "Cuerpo", lowLabel: "Ligero", highLabel: "Denso" },
  { key: "balance", label: "Balance", lowLabel: "Dominante", highLabel: "Equilibrado" },
  { key: "aftertaste", label: "Retrogusto", lowLabel: "Corto", highLabel: "Largo" },
] as const;

type MetricKey = typeof tasteMetrics[number]["key"];

export function FlowResults() {
  const router = useRouter();
  const { state, prevPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);

  // Local state
  const [brewTimeText, setBrewTimeText] = useState("3:00");
  const [metrics, setMetrics] = useState<Record<MetricKey, number>>({
    acidity: 3,
    sweetness: 3,
    body: 3,
    balance: 3,
    aftertaste: 3,
  });
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [tastingNotes, setTastingNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMetricChange = (key: MetricKey, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!state.coffeeId || !state.brewerId) {
      setError("Falta seleccionar café o cafetera");
      return;
    }

    const totalTimeS = parseBrewTime(brewTimeText);

    setIsSubmitting(true);
    setError(null);

    try {
      const notes = tastingNotes
        .split(",")
        .map((note) => note.trim())
        .filter((note) => note.length > 0);

      const response = await fetch("/api/brews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coffee_id: state.coffeeId,
          brewer_id: state.brewerId,
          settings: {
            dose_g: state.doseG,
            water_g: state.waterG,
            grind_setting: state.grindSetting,
            total_time_s: totalTimeS,
          },
          result: {
            rating: overallRating,
            tasting_notes: notes.length > 0 ? notes : undefined,
            feedback: feedback || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la preparación");
      }

      const brew = await response.json();
      setShowSuccess(true);

      setTimeout(() => {
        router.push(`/brews/${brew.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <>
        <FlowParticles />
        <div className="flow-content min-h-screen">
          <div className="flow-enter">
            <h2 className="flow-display flow-text-hero mb-4 text-[var(--flow-text-primary)]">
              ¡Guardado!
            </h2>
            <p className="flow-display-light flow-text-subtitle text-[var(--flow-text-secondary)]">
              Tu preparación ha sido registrada
            </p>
          </div>
        </div>
      </>
    );
  }

  const textPrimary = "text-[var(--charred)]";
  const textSecondary = "text-[var(--charred)]/80";
  const textMuted = "text-[var(--charred)]/50";

  return (
    <div className="flow-content min-h-screen pt-24 pb-12 overflow-y-auto" style={{ justifyContent: "flex-start" }}>
      {/* Header */}
      <div className="mb-8 flow-enter">
        <h2 className={`flow-display flow-text-title mb-2 ${textPrimary}`}>
          Resultados
        </h2>
        <p className={`flow-display-light flow-text-body ${textSecondary}`}>
          ¿Cómo quedó tu preparación?
        </p>
      </div>

      <div className="w-full max-w-md space-y-8 px-4">
        {/* Brew time */}
        <div className="flow-enter">
          <label className={`block text-sm mb-3 text-center ${textSecondary}`}>
            Tiempo Total
          </label>
          <div className="flex justify-center">
            <input
              type="text"
              value={brewTimeText}
              onChange={(e) => setBrewTimeText(e.target.value)}
              placeholder="3:00"
              className="bg-[var(--charred)] border-2 border-[var(--charred)]/30 px-6 py-3 font-mono text-2xl text-center text-[var(--paper)] focus:border-[var(--charred)] focus:outline-none"
              style={{ maxWidth: "140px" }}
            />
          </div>
          <p className={`text-xs text-center mt-2 ${textMuted}`}>
            Formato M:SS (ej: 3:15)
          </p>
        </div>

        {/* Overall rating - Coffee Beans */}
        <div className="flow-enter" style={{ animationDelay: "50ms" }}>
          <label className={`block text-sm mb-4 text-center ${textSecondary}`}>
            Calificación General
          </label>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected = overallRating !== null && rating <= overallRating;
              return (
                <button
                  key={rating}
                  onClick={() => setOverallRating(overallRating === rating ? null : rating)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <svg
                    width="36"
                    height="48"
                    viewBox="0 0 36 48"
                    fill="none"
                  >
                    {/* Coffee bean shape */}
                    <ellipse
                      cx="18"
                      cy="24"
                      rx="12"
                      ry="18"
                      fill={isSelected ? "#8B4513" : "rgba(60,36,21,0.2)"}
                    />
                    {/* Center line */}
                    <path
                      d="M18 8c-2 4-2 14 0 18s2 12 0 16"
                      stroke={isSelected ? "#5D2E0C" : "rgba(60,36,21,0.15)"}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Taste metrics */}
        <div className="flow-enter space-y-5" style={{ animationDelay: "100ms" }}>
          <label className={`block text-sm mb-2 text-center ${textSecondary}`}>
            Perfil de Sabor
          </label>

          {tasteMetrics.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {metric.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] w-16 text-right ${textMuted}`}>
                  {metric.lowLabel}
                </span>
                <div className="flex-1 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleMetricChange(metric.key, value)}
                      className={`flex-1 h-8 rounded-full transition-colors ${
                        value <= metrics[metric.key]
                          ? "bg-[var(--charred)]"
                          : "bg-[var(--charred)]/15 hover:bg-[var(--charred)]/25"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] w-16 ${textMuted}`}>
                  {metric.highLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tasting notes */}
        <div className="flow-enter" style={{ animationDelay: "150ms" }}>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            Notas de Cata (opcional)
          </label>
          <input
            type="text"
            value={tastingNotes}
            onChange={(e) => setTastingNotes(e.target.value)}
            placeholder="frutal, chocolate, nuez..."
            className={`w-full bg-[var(--charred)]/5 border-2 border-[var(--charred)]/20 rounded-lg px-4 py-3 ${textPrimary} placeholder:text-[var(--charred)]/30 focus:border-[var(--charred)]/50 focus:outline-none`}
          />
          <p className={`text-xs mt-1 ${textMuted}`}>
            Separadas por comas
          </p>
        </div>

        {/* Feedback */}
        <div className="flow-enter" style={{ animationDelay: "200ms" }}>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            Comentarios (opcional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="¿Qué ajustarías para la próxima?"
            rows={2}
            className={`w-full bg-[var(--charred)]/5 border-2 border-[var(--charred)]/20 rounded-lg px-4 py-3 resize-none ${textPrimary} placeholder:text-[var(--charred)]/30 focus:border-[var(--charred)]/50 focus:outline-none`}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4 flow-enter" style={{ animationDelay: "250ms" }}>
          <button
            onClick={prevPhase}
            className="px-6 py-3 border-2 border-[var(--charred)]/30 text-[var(--charred)]/70 font-display tracking-wider hover:border-[var(--charred)] hover:text-[var(--charred)] transition-colors"
          >
            ← ATRÁS
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex-1 max-w-[200px] py-3 bg-[var(--charred)] text-[var(--paper)] font-display tracking-wider hover:bg-[var(--charred)]/90 transition-colors ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "GUARDANDO..." : "GUARDAR"}
          </button>
        </div>

        {/* Discard link */}
        <button
          onClick={() => router.push("/")}
          className={`w-full text-center text-sm ${textMuted} hover:text-[var(--charred)] transition-colors`}
        >
          Descartar y volver al inicio
        </button>
      </div>
    </div>
  );
}
