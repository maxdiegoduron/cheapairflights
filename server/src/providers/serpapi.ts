import axios from "axios";
import { env } from "../config/env";

export interface ProviderPriceResult {
  date: string;
  /** Set only for round trips. */
  returnDate: string | null;
  price: number;
  currency: string;
  airline: string | null;
}

interface SerpApiFlightSegment {
  airline?: string;
}

interface SerpApiFlightOption {
  price?: number;
  flights?: SerpApiFlightSegment[];
}

interface SerpApiFlightsResponse {
  best_flights?: SerpApiFlightOption[];
  other_flights?: SerpApiFlightOption[];
}

/**
 * Fetches the cheapest price for a single departure date from SerpApi's
 * Google Flights engine. Passing `returnDate` prices a round trip instead of
 * a one-way. Isolated here so the provider can be swapped (e.g.
 * FlightAPI.io, a future Amadeus program) without touching callers.
 */
export async function fetchCheapestPriceForDate(
  origin: string,
  destination: string,
  date: string,
  returnDate?: string | null
): Promise<ProviderPriceResult | null> {
  const roundTrip = Boolean(returnDate);

  const response = await axios.get<SerpApiFlightsResponse>("https://serpapi.com/search", {
    params: {
      engine: "google_flights",
      departure_id: origin,
      arrival_id: destination,
      outbound_date: date,
      ...(roundTrip ? { return_date: returnDate } : {}),
      type: roundTrip ? 1 : 2, // 1 = round trip, 2 = one-way
      currency: "USD",
      api_key: env.serpApiKey,
    },
    timeout: 20000,
  });

  const options = [...(response.data.best_flights ?? []), ...(response.data.other_flights ?? [])];
  const priced = options.filter(
    (o): o is SerpApiFlightOption & { price: number } => typeof o.price === "number"
  );

  if (priced.length === 0) {
    return null;
  }

  const cheapest = priced.reduce((min, o) => (o.price < min.price ? o : min));

  return {
    date,
    returnDate: returnDate ?? null,
    price: cheapest.price,
    currency: "USD",
    airline: cheapest.flights?.[0]?.airline ?? null,
  };
}
