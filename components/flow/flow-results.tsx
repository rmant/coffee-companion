"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";
import { FlowParticles } from "./flow-particles";
import { parseBrewTime, formatBrewTime } from "@/lib/utils/brew-calculations";

// Taste metrics configuration
const tasteMetrics = [
  { key: "acidity", label: "Acidez", description: "Brillante / Plana" },
  { key: "sweetness", label: "Dulzor", description: "Intenso / Sutil" },
  { key: "body", label: "Cuerpo", description: "Denso / Ligero" },
  { key: "balance", label: "Balance", description: "Equilibrado / Dominante" },
  { key: "aftertaste", label: "Retrogusto", description: "Largo / Corto" },
] as const;

type MetricKey = typeof tasteMetrics[number]["key"];

export function FlowResults() {
  const router = useRouter();
  const { state, dispatch, prevPhase } = useFlow();
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
      // Parse tasting notes from comma-separated string
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

      // Redirect after showing success
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

  return (
    <div className="flow-content min-h-screen pt-28 pb-12 overflow-y-auto" style={{ justifyContent: "flex-start" }}>
      {/* Header */}
      <div className="mb-8 flow-enter">
        <h2
          className={`flow-display flow-text-title mb-2 ${
            isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]"
          }`}
        >
          Resultados
        </h2>
        <p
          className={`flow-display-light flow-text-body ${
            isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
          }`}
        >
          ¿Cómo quedó tu preparación?
        </p>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Brew time */}
        <div className="flow-enter">
          <label
            className={`block text-sm mb-3 text-center ${
              isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
            }`}
          >
            Tiempo Total
          </label>
          <div className="flex justify-center">
            <input
              type="text"
              value={brewTimeText}
              onChange={(e) => setBrewTimeText(e.target.value)}
              placeholder="3:00"
              className={`flow-input text-center ${isDark ? "" : "flow-input-dark"}`}
              style={{ maxWidth: "120px", fontSize: "1.75rem" }}
            />
          </div>
          <p
            className={`text-xs text-center mt-2 ${
              isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"
            }`}
          >
            Formato M:SS (ej: 3:15)
          </p>
        </div>

        {/* Overall rating */}
        <div className="flow-enter" style={{ animationDelay: "50ms" }}>
          <label
            className={`block text-sm mb-4 text-center ${
              isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
            }`}
          >
            Calificación General
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setOverallRating(overallRating === rating ? null : rating)}
                className="group transition-transform hover:scale-110 active:scale-95"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  className={`transition-colors ${
                    overallRating !== null && rating <= overallRating
                      ? "text-[#d4a574]"
                      : isDark
                      ? "text-white/20 group-hover:text-white/40"
                      : "text-[#3c2415]/20 group-hover:text-[#3c2415]/40"
                  }`}
                >
                  <ellipse cx="24" cy="24" rx="10" ry="16" fill="currentColor" />
                  <path
                    d="M24 10c-1.5 3-1.5 10 0 14s1.5 10 0 14"
                    stroke={
                      overallRating !== null && rating <= overallRating
                        ? "#3c2415"
                        : isDark
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(60,36,21,0.2)"
                    }
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Taste metrics */}
        <div className="flow-enter space-y-4" style={{ animationDelay: "100ms" }}>
          <label
            className={`block text-sm mb-2 text-center ${
              isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
            }`}
          >
            Perfil de Sabor
          </label>

          {tasteMetrics.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${
                    isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]"
                  }`}
                >
                  {metric.label}
                </span>
                <span
                  className={`text-xs ${
                    isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"
                  }`}
                >
                  {metric.description}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleMetricChange(metric.key, value)}
                    className={`flex-1 h-8 rounded-full transition-all ${
                      value <= metrics[metric.key]
                        ? "bg-[#c45c3e]"
                        : isDark
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-[#3c2415]/10 hover:bg-[#3c2415]/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tasting notes */}
        <div className="flow-enter" style={{ animationDelay: "150ms" }}>
          <label
            className={`block text-sm mb-2 ${
              isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
            }`}
          >
            Notas de Cata (opcional)
          </label>
          <input
            type="text"
            value={tastingNotes}
            onChange={(e) => setTastingNotes(e.target.value)}
            placeholder="frutal, chocolate, nuez..."
            className={`w-full bg-transparent border-2 rounded-lg px-4 py-3 transition-all ${
              isDark
                ? "border-white/20 text-[var(--flow-text-primary)] placeholder:text-[var(--flow-text-muted)] focus:border-white/40"
                : "border-[#3c2415]/20 text-[var(--flow-text-dark-primary)] placeholder:text-[var(--flow-text-dark-muted)] focus:border-[#3c2415]/40"
            }`}
          />
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"
            }`}
          >
            Separadas por comas
          </p>
        </div>

        {/* Feedback */}
        <div className="flow-enter" style={{ animationDelay: "200ms" }}>
          <label
            className={`block text-sm mb-2 ${
              isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
            }`}
          >
            Comentarios (opcional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="¿Qué ajustarías para la próxima?"
            rows={2}
            className={`w-full bg-transparent border-2 rounded-lg px-4 py-3 resize-none transition-all ${
              isDark
                ? "border-white/20 text-[var(--flow-text-primary)] placeholder:text-[var(--flow-text-muted)] focus:border-white/40"
                : "border-[#3c2415]/20 text-[var(--flow-text-dark-primary)] placeholder:text-[var(--flow-text-dark-muted)] focus:border-[#3c2415]/40"
            }`}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-4 pt-4 flow-enter" style={{ animationDelay: "250ms" }}>
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
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flow-btn-primary flex-1 ${isDark ? "" : "flow-btn-dark"} ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-25"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Guardar
              </>
            )}
          </button>
        </div>

        {/* Discard link */}
        <button
          onClick={() => router.push("/")}
          className={`w-full text-center text-sm ${
            isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"
          } hover:underline`}
        >
          Descartar y volver al inicio
        </button>
      </div>
    </div>
  );
}
