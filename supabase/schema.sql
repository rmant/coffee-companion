-- Coffee Companion Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Coffees table
CREATE TABLE coffees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  roaster TEXT NOT NULL,
  origin TEXT,
  process TEXT CHECK (process IN ('washed', 'natural', 'honey', 'anaerobic', 'other')),
  roast_level TEXT CHECK (roast_level IN ('light', 'medium-light', 'medium', 'medium-dark', 'dark')),
  roast_date DATE,
  flavor_notes TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'finished', 'wishlist')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brewers table
CREATE TABLE brewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('v60', 'chemex', 'origami', 'aeropress', 'kalita', 'other')),
  filter_type TEXT,
  default_dose_g NUMERIC,
  default_ratio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brews table
CREATE TABLE brews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coffee_id UUID REFERENCES coffees(id) ON DELETE CASCADE,
  brewer_id UUID REFERENCES brewers(id) ON DELETE SET NULL,
  brewed_at TIMESTAMPTZ DEFAULT NOW(),
  -- Settings
  dose_g NUMERIC,
  water_g NUMERIC,
  grind_setting NUMERIC,
  water_temp_c INTEGER,
  bloom_water_g NUMERIC,
  bloom_time_s INTEGER,
  total_time_s INTEGER,
  filter_type TEXT,
  -- Results
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tasting_notes TEXT[] DEFAULT '{}',
  feedback TEXT,
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table (for AI export equipment info)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grinder TEXT,
  kettle TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_coffees_status ON coffees(status);
CREATE INDEX idx_brews_coffee_id ON brews(coffee_id);
CREATE INDEX idx_brews_brewer_id ON brews(brewer_id);
CREATE INDEX idx_brews_brewed_at ON brews(brewed_at DESC);
CREATE INDEX idx_brews_rating ON brews(rating DESC);

-- Row Level Security (disabled for single-user app, but tables are ready)
-- If you want to enable RLS later for multi-user, uncomment these:
-- ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE brewers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE brews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
