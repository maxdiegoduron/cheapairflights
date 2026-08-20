import { Router } from "express";
import { searchPrices } from "../services/priceSearch";

const router = Router();

const IATA_CODE = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 10;

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/prices", async (req, res) => {
  const { origin, destination, startDate, endDate } = req.body ?? {};

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

  try {
    const result = await searchPrices({ origin, destination, startDate, endDate });
    res.json(result);
  } catch (err) {
    console.error("searchPrices failed:", err);
    res.status(502).json({ error: "Failed to fetch flight prices. Please try again." });
  }
});

export default router;
