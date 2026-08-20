export interface FlightPriceResult {
  date: string;
  /** Set only for round trips. */
  returnDate: string | null;
  price: number;
  currency: string;
  airline: string | null;
}

export interface PriceSearchResponse {
  origin: string;
  destination: string;
  roundTrip: boolean;
  /** True when the window was too wide to price exhaustively. */
  sampled: boolean;
  checkedCombinations: number;
  totalCombinations: number;
  results: FlightPriceResult[];
}

export interface PriceSearchRequest {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  minStayDays?: number;
  maxStayDays?: number;
}

export function googleFlightsUrl(
  origin: string,
  destination: string,
  date: string,
  returnDate?: string | null
): string {
  const query = returnDate
    ? `Flights from ${origin} to ${destination} on ${date} returning ${returnDate}`
    : `Flights from ${origin} to ${destination} on ${date}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

/** Whole days between two ISO dates, inclusive of both ends. */
export function nightsBetween(start: string, end: string): number {
  return Math.round(
    (new Date(end + "T00:00:00Z").getTime() - new Date(start + "T00:00:00Z").getTime()) / 86400000
  );
}
