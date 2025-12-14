"use client";

import { useState } from "react";
import { useFlow, type Coffee } from "./flow-provider";
import { isDarkPhase } from "./flow-gradient";
import { calculateDaysOffRoast } from "@/lib/utils/brew-calculations";
import { toast } from "sonner";

export function FlowCoffeeSelect() {
  const { state, selectCoffee, addCoffee, nextPhase, prevPhase } = useFlow();
  const isDark = isDarkPhase(state.phase);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [roaster, setRoaster] = useState("");
  const [roastDate, setRoastDate] = useState("");

  const handleSelect = (coffeeId: string) => {
    selectCoffee(coffeeId);
    // Auto-advance to next phase
    setTimeout(() => nextPhase(), 150);
  };

  const handleAddCoffee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roaster.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/coffees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          roaster: roaster.trim(),
          roast_date: roastDate || null,
          status: "active",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add coffee");
      }

      const newCoffee: Coffee = await res.json();
      addCoffee(newCoffee);
      toast.success("Café agregado");

      // Reset form and auto-advance
      setShowAddForm(false);
      setName("");
      setRoaster("");
      setRoastDate("");
      setTimeout(() => nextPhase(), 150);
    } catch (error) {
      toast.error("Error al agregar café");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flow-content min-h-screen py-20">
      {/* Header */}
      <div className="mb-8 flow-enter">
        <h2
          className={`flow-display flow-text-title mb-2 ${
            isDark ? "text-[var(--flow-text-primary)]" : "text-[var(--flow-text-dark-primary)]"
          }`}
        >
          {showAddForm ? "Nuevo Café" : "Elige tu Café"}
        </h2>
        <p
          className={`flow-display-light flow-text-body ${
            isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
          }`}
        >
          {showAddForm ? "Agrega los datos básicos" : "¿Qué granos prepararás hoy?"}
        </p>
      </div>

      {showAddForm ? (
        /* Quick Add Form */
        <form onSubmit={handleAddCoffee} className="w-full max-w-md space-y-4 mb-8 flow-enter">
          <div>
            <label
              htmlFor="coffee-name"
              className={`block text-sm mb-2 ${
                isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
              }`}
            >
              Nombre *
            </label>
            <input
              id="coffee-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Ethiopia Yirgacheffe"
              required
              className="flow-input w-full text-left text-base max-w-none"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="coffee-roaster"
              className={`block text-sm mb-2 ${
                isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
              }`}
            >
              Tostador *
            </label>
            <input
              id="coffee-roaster"
              type="text"
              value={roaster}
              onChange={(e) => setRoaster(e.target.value)}
              placeholder="ej. Café de Especialidad"
              required
              className="flow-input w-full text-left text-base max-w-none"
            />
          </div>

          <div>
            <label
              htmlFor="coffee-roast-date"
              className={`block text-sm mb-2 ${
                isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
              }`}
            >
              Fecha de Tueste
            </label>
            <input
              id="coffee-roast-date"
              type="date"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
              className="flow-input w-full text-left text-base max-w-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !roaster.trim()}
              className={`flow-btn-primary flex-1 ${isDark ? "" : "flow-btn-dark"}`}
            >
              {isSubmitting ? "Guardando..." : "Agregar y Continuar"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className={`flow-btn-primary ${isDark ? "" : "flow-btn-dark"} opacity-60 hover:opacity-100`}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Add New Coffee Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className={`flow-card ${isDark ? "" : "flow-card-dark"} w-full max-w-lg mb-4 flow-enter border-dashed`}
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-center gap-3 py-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"}
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`flow-display text-lg ${
                  isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"
                }`}
              >
                Agregar Nuevo Café
              </span>
            </div>
          </button>

          {/* Coffee cards */}
          <div className="w-full max-w-lg space-y-3 mb-8">
            {state.coffees.length === 0 ? (
              <div
                className={`flow-card ${isDark ? "" : "flow-card-dark"} text-center py-8`}
              >
                <p className={isDark ? "text-[var(--flow-text-secondary)]" : "text-[var(--flow-text-dark-secondary)]"}>
                  No hay cafés activos
                </p>
                <p className={`text-sm mt-2 ${isDark ? "text-[var(--flow-text-muted)]" : "text-[var(--flow-text-dark-muted)]"}`}>
                  Agrega uno arriba para continuar
                </p>
              </div>
            ) : (
              state.coffees.map((coffee, index) => {
                const daysOff = coffee.roast_date
                  ? calculateDaysOffRoast(coffee.roast_date)
                  : null;
                const isSelected = state.coffeeId === coffee.id;

                return (
                  <button
                    key={coffee.id}
                    onClick={() => handleSelect(coffee.id)}
                    className={`flow-card ${isDark ? "" : "flow-card-dark"} ${
                      isSelected ? "selected" : ""
                    } w-full flow-enter`}
                    style={{ animationDelay: `${(index + 1) * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`flow-display text-xl mb-1 truncate ${
                            isDark
                              ? "text-[var(--flow-text-primary)]"
                              : "text-[var(--flow-text-dark-primary)]"
                          }`}
                        >
                          {coffee.name}
                        </h3>
                        <p
                          className={`text-sm truncate ${
                            isDark
                              ? "text-[var(--flow-text-secondary)]"
                              : "text-[var(--flow-text-dark-secondary)]"
                          }`}
                        >
                          {coffee.roaster}
                        </p>
                        {coffee.origin && (
                          <p
                            className={`text-xs mt-1 ${
                              isDark
                                ? "text-[var(--flow-text-muted)]"
                                : "text-[var(--flow-text-dark-muted)]"
                            }`}
                          >
                            {coffee.origin}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {daysOff !== null && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDark
                                ? "bg-white/10 text-[var(--flow-text-secondary)]"
                                : "bg-[#3c2415]/10 text-[var(--flow-text-dark-secondary)]"
                            }`}
                          >
                            {daysOff}d
                          </span>
                        )}
                        {isSelected && (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={
                              isDark
                                ? "text-[var(--flow-text-primary)]"
                                : "text-[var(--terracotta)]"
                            }
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                            <path
                              d="M8 12l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Flavor notes */}
                    {coffee.flavor_notes && coffee.flavor_notes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {coffee.flavor_notes.slice(0, 3).map((note, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark
                                ? "bg-white/5 text-[var(--flow-text-muted)]"
                                : "bg-[#3c2415]/5 text-[var(--flow-text-dark-muted)]"
                            }`}
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Back button */}
          <button
            onClick={prevPhase}
            className={`flow-btn-primary ${isDark ? "" : "flow-btn-dark"} opacity-60 hover:opacity-100 flow-enter`}
            style={{ animationDelay: "300ms" }}
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
        </>
      )}
    </div>
  );
}
