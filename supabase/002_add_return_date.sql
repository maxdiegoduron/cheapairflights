-- Migration: round-trip support.
-- Run this once in the Supabase SQL Editor, after saved_routes.sql.
-- Existing rows are one-way trips, so the column is nullable with no default.

alter table public.saved_routes
  add column if not exists return_date date;
