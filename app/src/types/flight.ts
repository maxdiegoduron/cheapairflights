export interface FlightPriceResult {
  date: string;
  price: number;
  currency: string;
  airline: string | null;
}

export interface PriceSearchResponse {
  origin: string;
  destination: string;
  results: FlightPriceResult[];
}

export interface PriceSearchRequest {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export function googleFlightsUrl(origin: string, destination: string, date: string): string {
  const query = `Flights from ${origin} to ${destination} on ${date}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}
