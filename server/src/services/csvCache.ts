import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(__dirname, "..", "..", "data");
const CACHE_FILE = path.join(CACHE_DIR, "priceCache.csv");
const HEADER = "origin,destination,date,price,currency,airline,expiresAt";

export interface CacheEntry {
  origin: string;
  destination: string;
  date: string;
  price: number;
  currency: string;
  airline: string | null;
  expiresAt: number;
}

function cacheKey(origin: string, destination: string, date: string): string {
  return `${origin}|${destination}|${date}`;
}

function ensureFile(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, HEADER + "\n", "utf8");
  }
}

/**
 * Simple CSV-backed cache used as a lightweight "database" for now, so
 * cached prices survive server restarts without standing up a real DB.
 * Rows whose column count doesn't match the current header are skipped,
 * so an older-format cache file degrades to a cache miss rather than
 * loading garbage.
 */
export function loadCache(): Map<string, CacheEntry> {
  ensureFile();
  const map = new Map<string, CacheEntry>();
  const lines = fs.readFileSync(CACHE_FILE, "utf8").split("\n").filter(Boolean);
  const columnCount = HEADER.split(",").length;

  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    if (parts.length !== columnCount) continue;

    const [origin, destination, date, price, currency, airline, expiresAt] = parts;
    if (!origin) continue;

    map.set(cacheKey(origin, destination, date), {
      origin,
      destination,
      date,
      price: Number(price),
      currency,
      airline: airline || null,
      expiresAt: Number(expiresAt),
    });
  }

  return map;
}

export function saveCache(map: Map<string, CacheEntry>): void {
  ensureFile();
  const rows = [HEADER];
  for (const entry of map.values()) {
    // Airline is the one free-text field here; strip commas/newlines so a
    // stray character can't shift every column in the row.
    const airline = (entry.airline ?? "").replace(/[,\r\n]/g, " ").trim();
    rows.push(
      `${entry.origin},${entry.destination},${entry.date},${entry.price},${entry.currency},${airline},${entry.expiresAt}`
    );
  }
  fs.writeFileSync(CACHE_FILE, rows.join("\n") + "\n", "utf8");
}

export { cacheKey };
