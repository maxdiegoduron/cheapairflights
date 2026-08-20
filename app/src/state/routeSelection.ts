import { useSyncExternalStore } from "react";

export type AirportField = "origin" | "destination";

/** One-way prices every date, so its range stays capped. */
export const MAX_RANGE_DAYS = 10;
/** Round trip samples a wide travel window instead, so it can span months. */
export const MAX_WINDOW_DAYS = 365;
const DEFAULT_RANGE_DAYS = 7;

/** Must match MAX_COMBINATIONS in the backend's priceSearch service. */
export const MAX_COMBINATIONS = 30;

export type TripType = "oneway" | "roundtrip";

/**
 * Round trips come in two shapes: you already know the exact days you're
 * flying, or you only know roughly when and for how long.
 */
export type DateMode = "exact" | "flexible";

/** Longest trip the stay pickers allow, matching the server's validation. */
export const MAX_STAY_DAYS = 30;

interface RouteSelection {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: TripType;
  dateMode: DateMode;
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
  dateMode: "exact",
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

export function setDateMode(dateMode: DateMode) {
  state = { ...state, dateMode };
  emit();
}

/** Nights between two ISO dates — the trip length in "days away". */
export function nightsBetween(startDate: string, endDate: string): number {
  return Math.round(
    (new Date(endDate + "T00:00:00Z").getTime() - new Date(startDate + "T00:00:00Z").getTime()) /
      86400000
  );
}

export function setStayRange(minStayDays: number, maxStayDays: number) {
  state = { ...state, minStayDays, maxStayDays };
  emit();
}

/**
 * How many date/stay combinations a search covers: one per departure date
 * for a one-way, or every departure date crossed with every stay length for
 * a round trip. This is the *full* count — a wide round-trip window gets
 * sampled down to MAX_COMBINATIONS by the backend.
 */
type CountInput = {
  startDate: string;
  endDate: string;
  tripType: TripType;
  dateMode: DateMode;
  minStayDays: number;
  maxStayDays: number;
};

export function combinationCount(s: CountInput): number {
  if (s.tripType === "oneway") return rangeLengthDays(s.startDate, s.endDate);
  // Exact dates are a single trip: one departure, one return.
  if (s.dateMode === "exact") return 1;
  return rangeLengthDays(s.startDate, s.endDate) * (s.maxStayDays - s.minStayDays + 1);
}

/** How many of those combinations will actually be priced. */
export function checkedCount(s: CountInput): number {
  if (s.tripType === "oneway" || s.dateMode === "exact") return combinationCount(s);

  const stayCount = s.maxStayDays - s.minStayDays + 1;
  const dateBudget = Math.max(1, Math.floor(MAX_COMBINATIONS / stayCount));
  const dates = Math.min(rangeLengthDays(s.startDate, s.endDate), dateBudget);
  return dates * stayCount;
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
