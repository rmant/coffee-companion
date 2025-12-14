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
import type { Coffee, CoffeeInput, ProcessType, RoastLevel, CoffeeStatus } from "@/lib/types/database";

interface CoffeeFormProps {
  coffee?: Coffee;
  mode: "create" | "edit";
}

const processOptions: { value: ProcessType; label: string }[] = [
  { value: "washed", label: "Washed" },
  { value: "natural", label: "Natural" },
  { value: "honey", label: "Honey" },
  { value: "anaerobic", label: "Anaerobic" },
  { value: "other", label: "Other" },
];

const roastOptions: { value: RoastLevel; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "medium-light", label: "Medium-Light" },
  { value: "medium", label: "Medium" },
  { value: "medium-dark", label: "Medium-Dark" },
  { value: "dark", label: "Dark" },
];

const statusOptions: { value: CoffeeStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "finished", label: "Finished" },
  { value: "wishlist", label: "Wishlist" },
];

export function CoffeeForm({ coffee, mode }: CoffeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flavorNotesInput, setFlavorNotesInput] = useState(
    coffee?.flavor_notes?.join(", ") || ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const flavorNotes = flavorNotesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const data: CoffeeInput = {
      name: formData.get("name") as string,
      roaster: formData.get("roaster") as string,
      origin: (formData.get("origin") as string) || null,
      process: (formData.get("process") as ProcessType) || null,
      roast_level: (formData.get("roast_level") as RoastLevel) || null,
      roast_date: (formData.get("roast_date") as string) || null,
      flavor_notes: flavorNotes,
      status: (formData.get("status") as CoffeeStatus) || "active",
    };

    try {
      const url = mode === "create" ? "/api/coffees" : `/api/coffees/${coffee?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save coffee");
      }

      const savedCoffee = await res.json();
      toast.success(mode === "create" ? "Coffee added!" : "Coffee updated!");
      router.push(`/coffees/${savedCoffee.id}`);
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
            defaultValue={coffee?.name}
            placeholder="e.g., Ethiopia Yirgacheffe"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="roaster">Roaster *</Label>
          <Input
            id="roaster"
            name="roaster"
            defaultValue={coffee?.roaster}
            placeholder="e.g., Counter Culture"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="origin">Origin</Label>
          <Input
            id="origin"
            name="origin"
            defaultValue={coffee?.origin || ""}
            placeholder="e.g., Ethiopia"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="process">Process</Label>
            <Select name="process" defaultValue={coffee?.process || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select process" />
              </SelectTrigger>
              <SelectContent>
                {processOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="roast_level">Roast Level</Label>
            <Select name="roast_level" defaultValue={coffee?.roast_level || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select roast" />
              </SelectTrigger>
              <SelectContent>
                {roastOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="roast_date">Roast Date</Label>
            <Input
              id="roast_date"
              name="roast_date"
              type="date"
              defaultValue={coffee?.roast_date || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={coffee?.status || "active"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="flavor_notes">Flavor Notes (comma-separated)</Label>
          <Input
            id="flavor_notes"
            value={flavorNotesInput}
            onChange={(e) => setFlavorNotesInput(e.target.value)}
            placeholder="e.g., blueberry, chocolate, citrus"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Adding..."
              : "Saving..."
            : mode === "create"
            ? "Add Coffee"
            : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
