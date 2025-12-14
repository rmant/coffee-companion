import type { Brew, Coffee, Brewer, CoffeeWithDaysOffRoast, BrewWithRatio } from "@/lib/types/database";

/**
 * Calculate brew ratio from dose and water
 * @returns "1:X.X" format string or null
 */
export function calculateRatio(dose_g: number | null, water_g: number | null): string | null {
  if (!dose_g || !water_g || dose_g <= 0) return null;
  const ratio = water_g / dose_g;
  return `1:${ratio.toFixed(1)}`;
}

/**
 * Calculate days since roast date
 * @returns number of days or null if no roast date
 */
export function calculateDaysOffRoast(roast_date: string | null): number | null {
  if (!roast_date) return null;
  const roastDate = new Date(roast_date);
  const today = new Date();
  const diffTime = today.getTime() - roastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format brew time in seconds to M:SS or H:MM:SS
 */
export function formatBrewTime(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parse time string (M:SS) to seconds
 */
export function parseBrewTime(timeStr: string): number | null {
  const match = timeStr.match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);
  if (secs >= 60) return null;
  return mins * 60 + secs;
}

/**
 * Add computed fields to coffee
 */
export function withDaysOffRoast(coffee: Coffee): CoffeeWithDaysOffRoast {
  return {
    ...coffee,
    days_off_roast: calculateDaysOffRoast(coffee.roast_date),
  };
}

/**
 * Add computed fields to brew
 */
export function withRatio(brew: Brew): BrewWithRatio {
  return {
    ...brew,
    ratio: calculateRatio(brew.dose_g, brew.water_g),
  };
}

/**
 * Generate AI prompt context from brew data
 */
export function generateAIPromptContext(data: {
  equipment?: { grinder: string | null; kettle: string | null };
  brewer?: Brewer | null;
  coffee?: CoffeeWithDaysOffRoast | null;
  current_brew?: BrewWithRatio | null;
  recent_brews?: BrewWithRatio[];
}): string {
  const lines: string[] = [];

  lines.push("# Coffee Brew Analysis Request\n");

  // Equipment
  if (data.equipment?.grinder || data.equipment?.kettle) {
    lines.push("## Equipment");
    if (data.equipment.grinder) lines.push(`- Grinder: ${data.equipment.grinder}`);
    if (data.equipment.kettle) lines.push(`- Kettle: ${data.equipment.kettle}`);
    lines.push("");
  }

  // Brewer
  if (data.brewer) {
    lines.push("## Brewer");
    lines.push(`- ${data.brewer.name} (${data.brewer.type})`);
    if (data.brewer.filter_type) lines.push(`- Filter: ${data.brewer.filter_type}`);
    lines.push("");
  }

  // Coffee
  if (data.coffee) {
    lines.push("## Coffee");
    lines.push(`- ${data.coffee.name} by ${data.coffee.roaster}`);
    if (data.coffee.origin) lines.push(`- Origin: ${data.coffee.origin}`);
    if (data.coffee.process) lines.push(`- Process: ${data.coffee.process}`);
    if (data.coffee.roast_level) lines.push(`- Roast: ${data.coffee.roast_level}`);
    if (data.coffee.days_off_roast !== null) {
      lines.push(`- Days off roast: ${data.coffee.days_off_roast}`);
    }
    if (data.coffee.flavor_notes?.length) {
      lines.push(`- Tasting notes (bag): ${data.coffee.flavor_notes.join(", ")}`);
    }
    lines.push("");
  }

  // Current brew
  if (data.current_brew) {
    lines.push("## Current Brew");
    lines.push(`- Dose: ${data.current_brew.dose_g}g`);
    lines.push(`- Water: ${data.current_brew.water_g}g`);
    if (data.current_brew.ratio) lines.push(`- Ratio: ${data.current_brew.ratio}`);
    if (data.current_brew.grind_setting !== null) {
      lines.push(`- Grind: ${data.current_brew.grind_setting}`);
    }
    if (data.current_brew.water_temp_c !== null) {
      lines.push(`- Water temp: ${data.current_brew.water_temp_c}°C`);
    }
    if (data.current_brew.bloom_water_g !== null) {
      lines.push(`- Bloom: ${data.current_brew.bloom_water_g}g for ${data.current_brew.bloom_time_s}s`);
    }
    if (data.current_brew.total_time_s !== null) {
      lines.push(`- Total time: ${formatBrewTime(data.current_brew.total_time_s)}`);
    }
    if (data.current_brew.rating !== null) {
      lines.push(`- Rating: ${data.current_brew.rating}/5`);
    }
    if (data.current_brew.tasting_notes?.length) {
      lines.push(`- Tasting notes: ${data.current_brew.tasting_notes.join(", ")}`);
    }
    if (data.current_brew.feedback) {
      lines.push(`- Feedback: ${data.current_brew.feedback}`);
    }
    if (data.current_brew.goal) {
      lines.push(`- Goal for next brew: ${data.current_brew.goal}`);
    }
    lines.push("");
  }

  // Recent brews for context
  if (data.recent_brews?.length) {
    lines.push("## Recent Brew History");
    data.recent_brews.forEach((brew, i) => {
      lines.push(`\n### Brew ${i + 1}`);
      lines.push(`- ${brew.dose_g}g / ${brew.water_g}g (${brew.ratio})`);
      if (brew.grind_setting !== null) lines.push(`- Grind: ${brew.grind_setting}`);
      if (brew.total_time_s !== null) lines.push(`- Time: ${formatBrewTime(brew.total_time_s)}`);
      if (brew.rating !== null) lines.push(`- Rating: ${brew.rating}/5`);
      if (brew.feedback) lines.push(`- Notes: ${brew.feedback}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("Please analyze this brew and suggest improvements for the next attempt.");

  return lines.join("\n");
}
