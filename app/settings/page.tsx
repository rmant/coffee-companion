"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const [grinder, setGrinder] = useState("");
  const [kettle, setKettle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setGrinder(data.grinder || "");
          setKettle(data.kettle || "");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grinder: grinder.trim() || null,
          kettle: kettle.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Configuracion guardada");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-stone">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="section-header">
        <div className="flex-1">
          <h1 className="section-title">CONFIGURACION</h1>
          <p className="section-subtitle mt-1">Tu equipo de preparacion</p>
        </div>
      </section>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="brutalist-card max-w-xl">
        <div className="space-y-6">
          {/* Grinder */}
          <div>
            <label
              htmlFor="grinder"
              className="block font-mono text-xs text-stone uppercase tracking-wider mb-2"
            >
              Molino
            </label>
            <input
              id="grinder"
              type="text"
              value={grinder}
              onChange={(e) => setGrinder(e.target.value)}
              placeholder="ej: 1Zpresso X Ultra"
              className="w-full bg-charred border-2 border-concrete-light px-4 py-3 font-body text-paper placeholder:text-stone/50 focus:border-amber focus:outline-none transition-colors"
            />
            <p className="mt-1 font-mono text-[10px] text-stone">
              Se incluye en la exportacion para analisis AI
            </p>
          </div>

          {/* Kettle */}
          <div>
            <label
              htmlFor="kettle"
              className="block font-mono text-xs text-stone uppercase tracking-wider mb-2"
            >
              Tetera
            </label>
            <input
              id="kettle"
              type="text"
              value={kettle}
              onChange={(e) => setKettle(e.target.value)}
              placeholder="ej: Fellow Stagg EKG"
              className="w-full bg-charred border-2 border-concrete-light px-4 py-3 font-body text-paper placeholder:text-stone/50 focus:border-amber focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-concrete-light">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-brutalist"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <Link
              href="/"
              className="font-mono text-xs text-stone hover:text-paper transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>

      {/* Info */}
      <div className="brutalist-card max-w-xl bg-charred/50">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 flex items-center justify-center bg-amber/20 text-amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-display text-paper mb-1">EXPORTACION AI</p>
            <p className="font-body text-sm text-stone">
              Tu equipo se incluye automaticamente cuando exportas datos para
              analisis con AI, permitiendo recomendaciones mas precisas sobre
              ajustes de molienda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
