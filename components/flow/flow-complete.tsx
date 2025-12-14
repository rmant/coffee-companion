"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowParticles } from "./flow-particles";
import { FlowRating } from "./flow-rating";
import { useFlow } from "./flow-provider";

interface FlowCompleteProps {
  totalTimeS: number;
}

export function FlowComplete({ totalTimeS }: FlowCompleteProps) {
  const router = useRouter();
  const { state, dispatch } = useFlow();
  const [showNotes, setShowNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRatingChange = (rating: number | null) => {
    dispatch({ type: "SET_RATING", rating });
  };

  const handleNotesChange = (notes: string) => {
    dispatch({ type: "SET_TASTING_NOTES", notes });
  };

  const handleFeedbackChange = (feedback: string) => {
    dispatch({ type: "SET_FEEDBACK", feedback });
  };

  const handleSave = async () => {
    if (!state.coffeeId || !state.brewerId) {
      setError("Falta seleccionar café o cafetera");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse tasting notes from comma-separated string
      const tastingNotes = state.tastingNotes
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
            water_temp_c: state.waterTempC,
            bloom_water_g: state.bloomWaterG,
            bloom_time_s: state.bloomTimeS,
            total_time_s: totalTimeS,
          },
          result: {
            rating: state.rating,
            tasting_notes: tastingNotes.length > 0 ? tastingNotes : undefined,
            feedback: state.feedback || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la preparación");
      }

      const brew = await response.json();
      router.push(`/brews/${brew.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FlowParticles />

      <div className="flow-content min-h-screen relative z-10">
        {/* Celebration header */}
        <div className="mb-8 flow-enter">
          <h2 className="flow-display flow-text-hero mb-2 text-[var(--flow-text-primary)]">
            ¡Listo!
          </h2>
          <p className="flow-display-light flow-text-subtitle text-[var(--flow-text-secondary)]">
            Tu café está preparado
          </p>
        </div>

        {/* Total time */}
        <div
          className="mb-10 flow-enter"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-sm text-[var(--flow-text-muted)] mb-2">
            Tiempo total
          </p>
          <p className="flow-mono text-6xl text-[var(--flow-text-primary)]">
            {formatTime(totalTimeS)}
          </p>
        </div>

        {/* Rating */}
        <div
          className="mb-8 flow-enter"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-sm text-[var(--flow-text-secondary)] mb-4">
            ¿Cómo estuvo?
          </p>
          <FlowRating value={state.rating} onChange={handleRatingChange} />
        </div>

        {/* Toggle notes */}
        {!showNotes ? (
          <button
            onClick={() => setShowNotes(true)}
            className="text-[var(--flow-text-secondary)] text-sm underline mb-8 flow-enter hover:text-[var(--flow-text-primary)] transition-colors"
            style={{ animationDelay: "250ms" }}
          >
            + Agregar notas de cata
          </button>
        ) : (
          <div
            className="w-full max-w-sm space-y-4 mb-8 flow-enter"
            style={{ animationDelay: "250ms" }}
          >
            {/* Tasting notes */}
            <div>
              <label className="block text-sm text-[var(--flow-text-secondary)] mb-2">
                Notas de Cata
              </label>
              <input
                type="text"
                value={state.tastingNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="frutal, brillante, chocolate..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-[var(--flow-text-primary)] placeholder:text-[var(--flow-text-muted)] focus:outline-none focus:border-white/40"
              />
              <p className="text-xs text-[var(--flow-text-muted)] mt-1">
                Separadas por comas
              </p>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm text-[var(--flow-text-secondary)] mb-2">
                Comentarios
              </label>
              <textarea
                value={state.feedback}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                placeholder="¿Qué ajustarías para la próxima?"
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-[var(--flow-text-primary)] placeholder:text-[var(--flow-text-muted)] focus:outline-none focus:border-white/40 resize-none"
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`flow-btn-primary flow-enter ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : ""
          }`}
          style={{ animationDelay: "300ms" }}
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
              Guardar Preparación
            </>
          )}
        </button>

        {/* Skip link */}
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-[var(--flow-text-muted)] text-sm hover:text-[var(--flow-text-secondary)] transition-colors"
        >
          Descartar y volver al inicio
        </button>
      </div>
    </>
  );
}
