-- Cadavre Exquis Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drawings table
CREATE TABLE IF NOT EXISTS drawings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id TEXT NOT NULL,
  head_data TEXT NOT NULL,
  body_data TEXT NOT NULL,
  legs_data TEXT NOT NULL,
  head_signature TEXT,
  body_signature TEXT,
  legs_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON drawings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawings_team_id ON drawings(team_id);

-- Enable Row Level Security (RLS)
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (since this is a public installation)
-- For production, you might want to restrict this
CREATE POLICY "Allow all operations" ON drawings
  FOR ALL
  USING (true)
  WITH CHECK (true);
