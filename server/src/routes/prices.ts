import { Router } from "express";
import { MAX_COMBINATIONS, searchPrices } from "../services/priceSearch";

const router = Router();

const IATA_CODE = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 10;

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/prices", async (req, res) => {
  const { origin, destination, startDate, endDate, minStayDays, maxStayDays } = req.body ?? {};

  if (
    typeof origin !== "string" ||
    typeof destination !== "string" ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !IATA_CODE.test(origin) ||
    !IATA_CODE.test(destination) ||
    !DATE.test(startDate) ||
    !DATE.test(endDate)
  ) {
    res.status(400).json({
      error: "origin/destination must be 3-letter IATA codes; startDate/endDate must be YYYY-MM-DD.",
    });
    return;
  }

  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const rangeDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  if (rangeDays < 1 || rangeDays > MAX_RANGE_DAYS) {
    res.status(400).json({ error: `Date range must be between 1 and ${MAX_RANGE_DAYS} days.` });
    return;
  }

  // Round trip is opt-in: both stay bounds must be present and sane together.
  const wantsRoundTrip = minStayDays !== undefined || maxStayDays !== undefined;
  if (wantsRoundTrip) {
    const validStay = (v: unknown): v is number =>
      typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 30;

    if (!validStay(minStayDays) || !validStay(maxStayDays)) {
      res.status(400).json({ error: "Stay length must be whole numbers between 1 and 30 days." });
      return;
    }
    if (minStayDays > maxStayDays) {
      res.status(400).json({ error: "Minimum stay can't be longer than the maximum stay." });
      return;
    }

    const combinations = rangeDays * (maxStayDays - minStayDays + 1);
    if (combinations > MAX_COMBINATIONS) {
      res.status(400).json({
        error: `That's ${combinations} searches, over the ${MAX_COMBINATIONS} limit. Narrow your date range or stay length.`,
      });
      return;
    }
  }

  try {
    const result = await searchPrices({
      origin,
      destination,
      startDate,
      endDate,
      ...(wantsRoundTrip ? { minStayDays, maxStayDays } : {}),
    });
    res.json(result);
  } catch (err) {
    console.error("searchPrices failed:", err);
    res.status(502).json({ error: "Failed to fetch flight prices. Please try again." });
  }
});

export default router;
