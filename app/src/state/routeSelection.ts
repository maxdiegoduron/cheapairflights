import { useSyncExternalStore } from "react";

export type AirportField = "origin" | "destination";

export const MAX_RANGE_DAYS = 10;
const DEFAULT_RANGE_DAYS = 7;

/** Must match MAX_COMBINATIONS in the backend's priceSearch service. */
export const MAX_COMBINATIONS = 30;

export type TripType = "oneway" | "roundtrip";

interface RouteSelection {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: TripType;
  minStayDays: number;
  maxStayDays: number;
}

export function toISODate(date: Date): string {
  // Local calendar date (not UTC) so "today" matches the user's device.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultDates(): { startDate: string; endDate: string } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + DEFAULT_RANGE_DAYS - 1);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

// Module-level store so the picker routes (airport, dates) can write a
// selection that the search screen picks up, without threading values back
// through navigation params.
let state: RouteSelection = {
  origin: "",
  destination: "",
  ...defaultDates(),
  tripType: "oneway",
  minStayDays: 5,
  maxStayDays: 7,
};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setAirport(field: AirportField, code: string) {
  state = { ...state, [field]: code };
  emit();
}

export function swapAirports() {
  state = { ...state, origin: state.destination, destination: state.origin };
  emit();
}

export function setDateRange(startDate: string, endDate: string) {
  state = { ...state, startDate, endDate };
  emit();
}

export function setTripType(tripType: TripType) {
  state = { ...state, tripType };
  emit();
}

export function setStayRange(minStayDays: number, maxStayDays: number) {
  state = { ...state, minStayDays, maxStayDays };
  emit();
}

/**
 * How many provider calls a search would cost: one per departure date for a
 * one-way, or every departure date crossed with every stay length for a
 * round trip.
 */
export function combinationCount(s: {
  startDate: string;
  endDate: string;
  tripType: TripType;
  minStayDays: number;
  maxStayDays: number;
}): number {
  const days = rangeLengthDays(s.startDate, s.endDate);
  if (s.tripType === "oneway") return days;
  return days * (s.maxStayDays - s.minStayDays + 1);
}

export function useRouteSelection(): RouteSelection {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state
  );
}

/** Whole days between two ISO dates, inclusive of both ends. */
export function rangeLengthDays(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00Z").getTime();
  const end = new Date(endDate + "T00:00:00Z").getTime();
  return Math.round((end - start) / 86400000) + 1;
}
