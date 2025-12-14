"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlow } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";
import { FlowParticles } from "./flow-particles";
import { parseBrewTime } from "@/lib/utils/brew-calculations";

export function FlowResults() {
  const router = useRouter();
  const { state, prevPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);

  // Local state
  const [brewTimeText, setBrewTimeText] = useState("3:00");
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [tastingNotes, setTastingNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const textPrimary = isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]";
  const textSecondary = isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]";
  const textMuted = isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]";

  return (
    <div className="flow-content min-h-screen pt-24 pb-12 overflow-y-auto" style={{ justifyContent: "flex-start" }}>
      {/* Header */}
      <div className="mb-10 flow-enter">
        <h2 className={`flow-display flow-text-title mb-2 ${textPrimary}`}>
          Resultados
        </h2>
        <p className={`flow-display-light flow-text-body ${textSecondary}`}>
          ¿Cómo quedó tu preparación?
        </p>
      </div>

      <div className="w-full max-w-sm space-y-8 px-4">
        {/* Time & Rating Row */}
        <div className="flex gap-6 flow-enter">
          {/* Brew time */}
          <div className="flex-1">
            <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${textMuted}`}>
              Tiempo
            </label>
            <input
              type="text"
              value={brewTimeText}
              onChange={(e) => setBrewTimeText(e.target.value)}
              placeholder="3:00"
              className={`w-full bg-[var(--charred)] border-2 border-[var(--concrete-light)] px-4 py-3 font-mono text-2xl text-center ${textPrimary} focus:border-[var(--amber)] focus:outline-none`}
            />
            <p className={`text-[10px] text-center mt-1 ${textMuted}`}>
              M:SS
            </p>
          </div>

          {/* Rating */}
          <div className="flex-1">
            <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${textMuted}`}>
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setOverallRating(overallRating === rating ? null : rating)}
                  className={`flex-1 aspect-square border-2 transition-all ${
                    overallRating !== null && rating <= overallRating
                      ? "bg-[var(--amber)] border-[var(--amber)]"
                      : "bg-transparent border-[var(--concrete-light)] hover:border-[var(--amber)]/50"
                  }`}
                >
                  <span className={`font-mono text-sm ${
                    overallRating !== null && rating <= overallRating
                      ? "text-[var(--charred)]"
                      : textMuted
                  }`}>
                    {rating}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasting notes */}
        <div className="flow-enter" style={{ animationDelay: "50ms" }}>
          <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${textMuted}`}>
            Notas de Cata
          </label>
          <input
            type="text"
            value={tastingNotes}
            onChange={(e) => setTastingNotes(e.target.value)}
            placeholder="frutal, chocolate, nuez..."
            className={`w-full bg-[var(--charred)] border-2 border-[var(--concrete-light)] px-4 py-3 ${textPrimary} placeholder:${textMuted} focus:border-[var(--amber)] focus:outline-none`}
          />
          <p className={`text-[10px] mt-1 ${textMuted}`}>
            Separadas por comas (opcional)
          </p>
        </div>

        {/* Feedback */}
        <div className="flow-enter" style={{ animationDelay: "100ms" }}>
          <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${textMuted}`}>
            Notas para la próxima
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Moler más fino, menos agua de bloom..."
            rows={2}
            className={`w-full bg-[var(--charred)] border-2 border-[var(--concrete-light)] px-4 py-3 resize-none ${textPrimary} placeholder:${textMuted} focus:border-[var(--amber)] focus:outline-none`}
          />
        </div>

        {/* Recipe Summary */}
        <div className="flow-enter border-2 border-[var(--concrete-light)] p-4" style={{ animationDelay: "150ms" }}>
          <p className={`text-xs font-mono uppercase tracking-wider mb-3 ${textMuted}`}>
            Receta
          </p>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className={`font-mono text-2xl ${textPrimary}`}>{state.doseG}g</p>
              <p className={`text-[10px] uppercase ${textMuted}`}>Café</p>
            </div>
            <div className={`text-2xl ${textMuted}`}>/</div>
            <div className="text-center">
              <p className={`font-mono text-2xl ${textPrimary}`}>{state.waterG}g</p>
              <p className={`text-[10px] uppercase ${textMuted}`}>Agua</p>
            </div>
            {state.grindSetting && (
              <>
                <div className={`text-2xl ${textMuted}`}>/</div>
                <div className="text-center">
                  <p className={`font-mono text-2xl ${textPrimary}`}>{state.grindSetting}</p>
                  <p className={`text-[10px] uppercase ${textMuted}`}>Molienda</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2 flow-enter" style={{ animationDelay: "200ms" }}>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`w-full py-4 font-display text-xl tracking-wider bg-[var(--amber)] text-[var(--charred)] hover:bg-[var(--crema)] transition-colors ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "GUARDANDO..." : "GUARDAR"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={prevPhase}
              className={`flex-1 py-3 border-2 border-[var(--concrete-light)] font-mono text-sm uppercase tracking-wider ${textSecondary} hover:border-[var(--amber)] transition-colors`}
            >
              ← Atrás
            </button>
            <button
              onClick={() => router.push("/")}
              className={`flex-1 py-3 border-2 border-[var(--concrete-light)] font-mono text-sm uppercase tracking-wider ${textMuted} hover:border-red-500/50 hover:text-red-400 transition-colors`}
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
