"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { BrewerInput, BrewerType } from "@/lib/types/database";

const brewerTypes: { value: BrewerType; label: string }[] = [
  { value: "v60", label: "V60" },
  { value: "chemex", label: "Chemex" },
  { value: "origami", label: "Origami" },
  { value: "aeropress", label: "AeroPress" },
  { value: "kalita", label: "Kalita Wave" },
  { value: "other", label: "Other" },
];

export function BrewerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const data: BrewerInput = {
      name: formData.get("name") as string,
      type: formData.get("type") as BrewerType,
      filter_type: (formData.get("filter_type") as string) || null,
      default_dose_g: formData.get("default_dose_g")
        ? parseFloat(formData.get("default_dose_g") as string)
        : null,
      default_ratio: (formData.get("default_ratio") as string) || null,
    };

    try {
      const res = await fetch("/api/brewers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add brewer");
      }

      toast.success("Brewer added!");
      router.push("/brewers");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Hario V60 02"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Type *</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select brewer type" />
            </SelectTrigger>
            <SelectContent>
              {brewerTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="filter_type">Filter Type</Label>
          <Input
            id="filter_type"
            name="filter_type"
            placeholder="e.g., Tabbed paper filter"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="default_dose_g">Default Dose (g)</Label>
            <Input
              id="default_dose_g"
              name="default_dose_g"
              type="number"
              step="0.1"
              placeholder="e.g., 15"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="default_ratio">Default Ratio</Label>
            <Input
              id="default_ratio"
              name="default_ratio"
              placeholder="e.g., 1:16"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Brewer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
