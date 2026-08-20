import { fetchCheapestPriceForDate, ProviderPriceResult } from "../providers/serpapi";
import { cacheKey, loadCache, saveCache } from "./csvCache";

export interface PriceSearchParams {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  /** Round trip when set: number of days away, inclusive range. */
  minStayDays?: number;
  maxStayDays?: number;
}

export interface PriceSearchResult {
  origin: string;
  destination: string;
  roundTrip: boolean;
  /** True when the window was too wide to price exhaustively. */
  sampled: boolean;
  checkedCombinations: number;
  totalCombinations: number;
  results: ProviderPriceResult[];
}

/** Hard ceiling on provider calls per search, to protect the free quota. */
export const MAX_COMBINATIONS = 30;

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

function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getCachedOrFetch(
  origin: string,
  destination: string,
  date: string,
  returnDate: string | null
): Promise<ProviderPriceResult | null> {
  const key = cacheKey(origin, destination, date, returnDate);
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return {
      date: cached.date,
      returnDate: cached.returnDate,
      price: cached.price,
      currency: cached.currency,
      airline: cached.airline,
    };
  }

  const result = await fetchCheapestPriceForDate(origin, destination, date, returnDate);

  // Only persist successful lookups; a miss (no prices found) isn't worth
  // caching to disk since it's rare and cheap to just retry next time.
  if (result) {
    cache.set(key, {
      origin,
      destination,
      date,
      returnDate,
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

/**
 * Thins a list of departure dates down to at most `limit`, keeping them
 * evenly spread so a wide window still gets sampled end to end (and always
 * keeps the last date, so the far edge of the window is represented).
 */
export function sampleEvenly<T>(items: T[], limit: number): T[] {
  if (items.length <= limit || limit < 1) return items;
  if (limit === 1) return [items[0]];

  const step = (items.length - 1) / (limit - 1);
  const picked: T[] = [];
  for (let i = 0; i < limit; i++) {
    picked.push(items[Math.round(i * step)]);
  }
  return Array.from(new Set(picked));
}

export async function searchPrices(params: PriceSearchParams): Promise<PriceSearchResult> {
  const { origin, destination, startDate, endDate, minStayDays, maxStayDays } = params;
  const roundTrip = typeof minStayDays === "number" && typeof maxStayDays === "number";
  const allDates = enumerateDates(startDate, endDate);
  const stayCount = roundTrip ? maxStayDays! - minStayDays! + 1 : 1;

  const totalCombinations = allDates.length * stayCount;

  // A wide window (say October to February) can be hundreds of combinations,
  // far past the free quota. Rather than refuse, thin the departure dates
  // evenly so the whole window is still represented — every stay length is
  // kept for each sampled date, so the comparison between trip lengths stays
  // fair.
  const dateBudget = Math.max(1, Math.floor(MAX_COMBINATIONS / stayCount));
  const dates = sampleEvenly(allDates, dateBudget);

  const pairs: { date: string; returnDate: string | null }[] = [];
  for (const date of dates) {
    if (roundTrip) {
      for (let stay = minStayDays!; stay <= maxStayDays!; stay++) {
        pairs.push({ date, returnDate: addDays(date, stay) });
      }
    } else {
      pairs.push({ date, returnDate: null });
    }
  }

  const results = await mapWithConcurrency(pairs, 3, (pair) =>
    getCachedOrFetch(origin, destination, pair.date, pair.returnDate)
  );

  return {
    origin,
    destination,
    roundTrip,
    sampled: pairs.length < totalCombinations,
    checkedCombinations: pairs.length,
    totalCombinations,
    results: results.filter((r): r is ProviderPriceResult => r !== null),
  };
}
