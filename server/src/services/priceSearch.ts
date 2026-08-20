import { fetchCheapestPriceForDate, ProviderPriceResult } from "../providers/serpapi";
import { cacheKey, loadCache, saveCache } from "./csvCache";

export interface PriceSearchParams {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export interface PriceSearchResult {
  origin: string;
  destination: string;
  results: ProviderPriceResult[];
}

const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// Loaded once at startup from the CSV file (our lightweight "database" for
// now) and kept in memory for fast lookups; writes go back to the CSV.
const cache = loadCache();

function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

async function getCachedOrFetch(
  origin: string,
  destination: string,
  date: string
): Promise<ProviderPriceResult | null> {
  const key = cacheKey(origin, destination, date);
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return {
      date: cached.date,
      price: cached.price,
      currency: cached.currency,
      airline: cached.airline,
    };
  }

  const result = await fetchCheapestPriceForDate(origin, destination, date);

  // Only persist successful lookups; a miss (no prices found) isn't worth
  // caching to disk since it's rare and cheap to just retry next time.
  if (result) {
    cache.set(key, {
      origin,
      destination,
      date,
      price: result.price,
      currency: result.currency,
      airline: result.airline,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    saveCache(cache);
  }

  return result;
}

// Limits concurrent SerpApi calls so a wide date range doesn't fire a burst
// of requests at once and trip provider rate limits.
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await fn(items[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

export async function searchPrices(params: PriceSearchParams): Promise<PriceSearchResult> {
  const { origin, destination, startDate, endDate } = params;
  const dates = enumerateDates(startDate, endDate);

  const results = await mapWithConcurrency(dates, 3, (date) =>
    getCachedOrFetch(origin, destination, date)
  );

  return {
    origin,
    destination,
    results: results.filter((r): r is ProviderPriceResult => r !== null),
  };
}
