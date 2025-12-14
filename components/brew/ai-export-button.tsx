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
import { Textarea } from "@/components/ui/textarea";
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
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleExport} disabled={isLoading}>
          {isLoading ? "Exporting..." : "Export for AI"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>AI Analysis Export</DialogTitle>
          <DialogDescription>
            Copy this context to share with an AI assistant for brew analysis and
            recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={promptContext}
            readOnly
            className="min-h-[400px] font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopy}>Copy to Clipboard</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
