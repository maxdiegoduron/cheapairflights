import { useSyncExternalStore } from "react";

export type AirportField = "origin" | "destination";

interface RouteSelection {
  origin: string;
  destination: string;
}

// Module-level store so the airport picker (a separate route) can write a
// selection that the search screen picks up when it regains focus, without
// threading values back through navigation params.
let state: RouteSelection = { origin: "", destination: "" };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setAirport(field: AirportField, code: string) {
  state = { ...state, [field]: code };
  emit();
}

export function swapAirports() {
  state = { origin: state.destination, destination: state.origin };
  emit();
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
