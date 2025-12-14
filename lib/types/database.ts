// Database types for Supabase

export type ProcessType = "washed" | "natural" | "honey" | "anaerobic" | "other";
export type RoastLevel = "light" | "medium-light" | "medium" | "medium-dark" | "dark";
export type CoffeeStatus = "active" | "finished" | "wishlist";
export type BrewerType = "v60" | "chemex" | "origami" | "aeropress" | "kalita" | "other";

// Database row types
export interface Coffee {
  id: string;
  name: string;
  roaster: string;
  origin: string | null;
  process: ProcessType | null;
  roast_level: RoastLevel | null;
  roast_date: string | null;
  flavor_notes: string[];
  status: CoffeeStatus;
  created_at: string;
}

export interface Brewer {
  id: string;
  name: string;
  type: BrewerType;
  filter_type: string | null;
  default_dose_g: number | null;
  default_ratio: string | null;
  created_at: string;
}

export interface Brew {
  id: string;
  coffee_id: string;
  brewer_id: string | null;
  brewed_at: string;
  // Settings
  dose_g: number | null;
  water_g: number | null;
  grind_setting: number | null;
  water_temp_c: number | null;
  bloom_water_g: number | null;
  bloom_time_s: number | null;
  total_time_s: number | null;
  filter_type: string | null;
  // Results
  rating: number | null;
  tasting_notes: string[];
  feedback: string | null;
  goal: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  grinder: string | null;
  kettle: string | null;
  updated_at: string;
}

// Input types for creating/updating
export interface CoffeeInput {
  name: string;
  roaster: string;
  origin?: string | null;
  process?: ProcessType | null;
  roast_level?: RoastLevel | null;
  roast_date?: string | null;
  flavor_notes?: string[];
  status?: CoffeeStatus;
}

export interface BrewerInput {
  name: string;
  type: BrewerType;
  filter_type?: string | null;
  default_dose_g?: number | null;
  default_ratio?: string | null;
}

export interface BrewSettings {
  dose_g?: number | null;
  water_g?: number | null;
  grind_setting?: number | null;
  water_temp_c?: number | null;
  bloom_water_g?: number | null;
  bloom_time_s?: number | null;
  total_time_s?: number | null;
  filter_type?: string | null;
}

export interface BrewResult {
  rating?: number | null;
  tasting_notes?: string[];
  feedback?: string | null;
  goal?: string | null;
}

export interface BrewInput {
  coffee_id: string;
  brewer_id: string;
  settings?: BrewSettings;
  result?: BrewResult;
}

// API response types with computed fields
export interface CoffeeWithDaysOffRoast extends Coffee {
  days_off_roast: number | null;
}

export interface BrewWithRatio extends Brew {
  ratio: string | null;
}

// Brew with related data
export interface BrewWithRelations extends BrewWithRatio {
  coffee?: Coffee;
  brewer?: Brewer;
}

// AI Export types
export interface AIExport {
  equipment: {
    grinder: string | null;
    kettle: string | null;
  };
  brewer: Brewer | null;
  coffee: CoffeeWithDaysOffRoast | null;
  current_brew: BrewWithRatio | null;
  recent_brews: BrewWithRatio[];
  prompt_context: string;
}

// Supabase Database type for client
export interface Database {
  public: {
    Tables: {
      coffees: {
        Row: Coffee;
        Insert: CoffeeInput & { id?: string; created_at?: string };
        Update: Partial<CoffeeInput>;
      };
      brewers: {
        Row: Brewer;
        Insert: BrewerInput & { id?: string; created_at?: string };
        Update: Partial<BrewerInput>;
      };
      brews: {
        Row: Brew;
        Insert: {
          coffee_id: string;
          brewer_id?: string | null;
          brewed_at?: string;
          dose_g?: number | null;
          water_g?: number | null;
          grind_setting?: number | null;
          water_temp_c?: number | null;
          bloom_water_g?: number | null;
          bloom_time_s?: number | null;
          total_time_s?: number | null;
          filter_type?: string | null;
          rating?: number | null;
          tasting_notes?: string[];
          feedback?: string | null;
          goal?: string | null;
        };
        Update: Partial<Brew>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<UserSettings>;
        Update: Partial<UserSettings>;
      };
    };
  };
}
