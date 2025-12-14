"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { calculateRatio, formatBrewTime, parseBrewTime } from "@/lib/utils/brew-calculations";
import type { Coffee, Brewer, BrewSettings, BrewInput } from "@/lib/types/database";
import { RatingStars } from "@/components/brew/rating-stars";

interface BrewFormProps {
  coffees: Coffee[];
  brewers: Brewer[];
}

export function BrewForm({ coffees, brewers }: BrewFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCoffeeId = searchParams.get("coffee_id");
  const preselectedBrewerId = searchParams.get("brewer_id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coffeeId, setCoffeeId] = useState(preselectedCoffeeId || "");
  const [brewerId, setBrewerId] = useState(preselectedBrewerId || "");

  // Settings
  const [doseG, setDoseG] = useState("");
  const [waterG, setWaterG] = useState("");
  const [grindSetting, setGrindSetting] = useState("");
  const [waterTempC, setWaterTempC] = useState("");
  const [bloomWaterG, setBloomWaterG] = useState("");
  const [bloomTimeS, setBloomTimeS] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [filterType, setFilterType] = useState("");

  // Results
  const [rating, setRating] = useState<number | null>(null);
  const [tastingNotes, setTastingNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [goal, setGoal] = useState("");

  // Computed ratio
  const ratio = calculateRatio(
    doseG ? parseFloat(doseG) : null,
    waterG ? parseFloat(waterG) : null
  );

  // Load last settings when coffee/brewer combo changes
  useEffect(() => {
    if (coffeeId && brewerId) {
      fetchLastSettings();
    }
  }, [coffeeId, brewerId]);

  // Load brewer defaults when brewer changes
  useEffect(() => {
    if (brewerId && !coffeeId) {
      const brewer = brewers.find((b) => b.id === brewerId);
      if (brewer) {
        if (brewer.default_dose_g) setDoseG(brewer.default_dose_g.toString());
        if (brewer.filter_type) setFilterType(brewer.filter_type);
      }
    }
  }, [brewerId, brewers, coffeeId]);

  async function fetchLastSettings() {
    try {
      const res = await fetch(
        `/api/brews/last-settings?coffee_id=${coffeeId}&brewer_id=${brewerId}`
      );
      if (res.ok) {
        const settings: BrewSettings = await res.json();
        if (settings.dose_g) setDoseG(settings.dose_g.toString());
        if (settings.water_g) setWaterG(settings.water_g.toString());
        if (settings.grind_setting) setGrindSetting(settings.grind_setting.toString());
        if (settings.water_temp_c) setWaterTempC(settings.water_temp_c.toString());
        if (settings.bloom_water_g) setBloomWaterG(settings.bloom_water_g.toString());
        if (settings.bloom_time_s) setBloomTimeS(settings.bloom_time_s.toString());
        if (settings.total_time_s) setTotalTime(formatBrewTime(settings.total_time_s));
        if (settings.filter_type) setFilterType(settings.filter_type);
        toast.info("Loaded previous settings");
      }
    } catch {
      // No previous settings, that's fine
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const totalTimeS = parseBrewTime(totalTime);
    const notes = tastingNotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const data: BrewInput = {
      coffee_id: coffeeId,
      brewer_id: brewerId,
      settings: {
        dose_g: doseG ? parseFloat(doseG) : null,
        water_g: waterG ? parseFloat(waterG) : null,
        grind_setting: grindSetting ? parseFloat(grindSetting) : null,
        water_temp_c: waterTempC ? parseInt(waterTempC, 10) : null,
        bloom_water_g: bloomWaterG ? parseFloat(bloomWaterG) : null,
        bloom_time_s: bloomTimeS ? parseInt(bloomTimeS, 10) : null,
        total_time_s: totalTimeS,
        filter_type: filterType || null,
      },
      result: {
        rating,
        tasting_notes: notes,
        feedback: feedback || null,
        goal: goal || null,
      },
    };

    try {
      const res = await fetch("/api/brews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to log brew");
      }

      const brew = await res.json();
      toast.success("Brew logged!");
      router.push(`/brews/${brew.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Coffee & Brewer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="coffee">Coffee *</Label>
              <Select value={coffeeId} onValueChange={setCoffeeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select coffee" />
                </SelectTrigger>
                <SelectContent>
                  {coffees.map((coffee) => (
                    <SelectItem key={coffee.id} value={coffee.id}>
                      {coffee.name} ({coffee.roaster})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brewer">Brewer *</Label>
              <Select value={brewerId} onValueChange={setBrewerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select brewer" />
                </SelectTrigger>
                <SelectContent>
                  {brewers.map((brewer) => (
                    <SelectItem key={brewer.id} value={brewer.id}>
                      {brewer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="filter_type">Filter Type</Label>
              <Input
                id="filter_type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                placeholder="e.g., Tabbed paper"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brew Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dose_g">Dose (g)</Label>
                <Input
                  id="dose_g"
                  type="number"
                  step="0.1"
                  value={doseG}
                  onChange={(e) => setDoseG(e.target.value)}
                  placeholder="15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="water_g">Water (g)</Label>
                <Input
                  id="water_g"
                  type="number"
                  step="1"
                  value={waterG}
                  onChange={(e) => setWaterG(e.target.value)}
                  placeholder="250"
                />
              </div>
            </div>

            {ratio && (
              <p className="text-sm text-muted-foreground">Ratio: {ratio}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grind_setting">Grind Setting</Label>
                <Input
                  id="grind_setting"
                  type="number"
                  step="0.5"
                  value={grindSetting}
                  onChange={(e) => setGrindSetting(e.target.value)}
                  placeholder="e.g., 24"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="water_temp_c">Water Temp (°C)</Label>
                <Input
                  id="water_temp_c"
                  type="number"
                  value={waterTempC}
                  onChange={(e) => setWaterTempC(e.target.value)}
                  placeholder="96"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bloom_water_g">Bloom Water (g)</Label>
                <Input
                  id="bloom_water_g"
                  type="number"
                  value={bloomWaterG}
                  onChange={(e) => setBloomWaterG(e.target.value)}
                  placeholder="45"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bloom_time_s">Bloom Time (s)</Label>
                <Input
                  id="bloom_time_s"
                  type="number"
                  value={bloomTimeS}
                  onChange={(e) => setBloomTimeS(e.target.value)}
                  placeholder="45"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="total_time">Total Time (M:SS)</Label>
              <Input
                id="total_time"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                placeholder="3:00"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Rating</Label>
            <RatingStars value={rating} onChange={setRating} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tasting_notes">Tasting Notes (comma-separated)</Label>
            <Input
              id="tasting_notes"
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
              placeholder="e.g., fruity, bright, clean"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well or not so well?"
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="goal">Goal for Next Brew</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What would you try differently?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || !coffeeId || !brewerId}>
          {isSubmitting ? "Logging..." : "Log Brew"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
