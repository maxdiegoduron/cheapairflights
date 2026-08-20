import { PriceSearchRequest, PriceSearchResponse } from "../types/flight";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function searchPrices(params: PriceSearchRequest): Promise<PriceSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/prices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? "Something went wrong. Please try again.");
  }

  return body as PriceSearchResponse;
}
