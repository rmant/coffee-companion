"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AIExportButtonProps {
  brewId: string;
}

export function AIExportButton({ brewId }: AIExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promptContext, setPromptContext] = useState("");

  async function handleExport() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/export/ai?brew_id=${brewId}&include_history=3`);
      if (!res.ok) {
        throw new Error("Failed to export data");
      }
      const data = await res.json();
      setPromptContext(data.prompt_context);
      setIsOpen(true);
    } catch {
      toast.error("Failed to export data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptContext);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("Error al copiar");
    }
  }

  // Parse markdown into sections for better display
  const sections = promptContext.split(/^## /m).filter(Boolean).map(section => {
    const lines = section.split('\n');
    const title = lines[0].replace(/^# /, '');
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleExport} disabled={isLoading}>
          {isLoading ? "Exportando..." : "Exportar para AI"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col bg-[var(--charred)] border-[var(--concrete-light)]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display text-2xl text-paper">
            EXPORTAR PARA AI
          </DialogTitle>
          <DialogDescription className="text-stone">
            Copia este contexto para compartir con un asistente AI y obtener análisis y recomendaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {sections.map((section, index) => (
            <div key={index} className="border border-concrete-light p-4">
              <h3 className="font-display text-amber text-sm tracking-wider mb-3">
                {section.title.toUpperCase()}
              </h3>
              <div className="space-y-1">
                {section.content.split('\n').map((line, lineIndex) => {
                  // Handle subsection headers (###)
                  if (line.startsWith('### ')) {
                    return (
                      <p key={lineIndex} className="font-mono text-xs text-crema mt-3 mb-1">
                        {line.replace('### ', '')}
                      </p>
                    );
                  }
                  // Handle list items
                  if (line.startsWith('- ')) {
                    const [label, ...valueParts] = line.slice(2).split(': ');
                    const value = valueParts.join(': ');
                    if (value) {
                      return (
                        <div key={lineIndex} className="flex justify-between items-baseline py-0.5">
                          <span className="font-mono text-xs text-stone">{label}</span>
                          <span className="font-body text-sm text-paper">{value}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={lineIndex} className="font-body text-sm text-paper py-0.5">
                        {line.slice(2)}
                      </p>
                    );
                  }
                  // Skip empty lines
                  if (!line.trim()) return null;
                  // Regular text
                  return (
                    <p key={lineIndex} className="font-body text-sm text-paper/80">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 flex justify-between items-center gap-3 pt-4 border-t border-concrete-light">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 font-mono text-xs text-stone hover:text-paper transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleCopy}
            className="px-6 py-2 bg-amber text-charred font-display tracking-wider hover:bg-crema transition-colors"
          >
            COPIAR CONTEXTO
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
