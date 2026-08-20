# Progress Log — Cheaper Flights App

> Read this file first at the start of any session on this project. Update it at the end of any session with meaningful progress.

## Project Summary

A free, cross-platform app to find the cheapest date to fly a route. Web first (Expo web), then real iOS/Android apps via Expo/EAS, no rewrite needed. Backend proxies SerpApi's Google Flights API to keep the API key secret.

Full plan: see the plan approved on 2026-08-20 (steps, architecture, decisions) — ask Claude to recall it if needed, or check conversation history.

## Key Decisions (don't re-litigate without a reason)

- Feature: price comparison across a date range (not live flight-status tracking).
- Data provider: **SerpApi Google Flights API** (Amadeus's free tier was decommissioned ~July 2026; Google has no public Flights API).
- Default search range: 5–7 days (to conserve free API quota — 1 date = 1 API call), capped at 10 days server-side.
- Frontend: Expo (React Native + Web) via Expo Router.
- Backend: Node/Express, holds `SERPAPI_KEY`, deployed free on Render.
- **Database: a CSV file** (`server/data/priceCache.csv`), not a real DB — user asked for CSV "for now". Backend loads it into memory at startup, writes back on every new cached price, 4-hour TTL per entry.
- Design direction: light theme with a manual dark-mode toggle, Facebook-app-inspired (Facebook blue `#1877F2` accent, light-gray `#F0F2F5` background, rounded cards) — user explicitly asked for this look. Tokens live in `app/src/theme/colors.ts` + `ThemeContext.tsx`. Theme choice is in-session only (not yet persisted across restarts — noted as a v2 nicety below).
- Debugging: `.vscode/launch.json` at project root has 3 configs — "Debug Server (direct)", "Debug Server (watch mode)", "Debug Web (Chrome)".

## Current State (as of 2026-08-20, end of iOS redesign session)

**The app has been rebuilt as a native-iOS-style 4-tab app with accounts, saved flights, airline details, and a help screen. Design spec: `docs/superpowers/specs/2026-08-20-ios-redesign-accounts-design.md`.**

- `server/` — Express + TypeScript. Routes: `GET /api/health`, `POST /api/prices`. Now also returns the **airline** of the cheapest flight per date (`providers/serpapi.ts` picks the cheapest flight *option* and reads `flights[0].airline`). CSV cache gained an `airline` column; rows with a mismatched column count are skipped so old-format files degrade to a cache miss. Typechecks clean.
- `app/` — Expo Router with a `(tabs)` group: **Search / Saved / Account / Help**, plus `results` and a `flight-detail` modal as root-stack siblings.
  - iOS design system in `src/theme/colors.ts` (system blue, iOS grouped grays, proper dark palette) + reusable inset-grouped components in `src/components/ui.tsx`.
  - Supabase auth in `src/supabase/` (`client.ts`, `AuthContext.tsx`, `savedRoutes.ts`). Anon key is client-side by design; RLS is the security boundary.
  - Results rows are tappable → detail modal showing airline + a free Google Flights deep link (no extra API call — URL built client-side in `src/types/flight.ts`).
  - Bookmark icon on each result saves/removes a `saved_routes` row; Saved tab lists them with delete.
- Verified end-to-end in the browser via Playwright: all four tabs render in both light and dark, live search returned real airlines (Delta, Alaska) and prices, detail modal correct, zero console errors.

## Known Gaps / Not Done Yet

1. ~~No real SerpApi key~~ — **done 2026-08-20.** Verified live (JFK→LAX returned real prices + airlines).
2. ~~Supabase project not created~~ — **done 2026-08-20.** Project `cheapflights` (ref `hsltrmnpqhybrrwffznl`) is live. `saved_routes` table + RLS created via `supabase/saved_routes.sql`; "Confirm email" turned off. Both env vars are in `app/.env`. Note: Supabase's new key format is used — the **publishable** key (`sb_publishable_...`) goes in `EXPO_PUBLIC_SUPABASE_ANON_KEY`; the `sb_secret_` key must never go in the app.
3. ~~Auth + saved-flights flow unverified~~ — **verified 2026-08-20.** Full Playwright run passed: signup → auto sign-in → search → bookmark → row appears in Saved tab → delete → row gone. Zero console errors.
4. **Not deployed anywhere yet** — only tested locally. Render deployment (backend) still to do.
5. **Not tested in Expo Go on a real phone yet** — only as a web page via Playwright. Worth doing since large-title/blur/modal behavior differs on real iOS.
6. No git repo initialized — user explicitly chose to hold off on git for now (asked and declined 2026-08-20).
7. Theme toggle choice doesn't persist across restarts (in-memory only).
8. `npm audit` shows 15 vulnerabilities (7 moderate, 8 high), mostly Expo tooling transitives — uninvestigated, worth a look before real deployment.

### 2026-08-20 — Airport picker
- Replaced the raw 3-letter code text inputs with a searchable airport picker (user request: dropdown showing the code in parentheses).
- `src/data/airports.ts` — ~150 major world airports bundled (code/name/city/country) plus `searchAirports()` with ranked matching (exact code → code prefix → city prefix → city contains → name → country). Add airports by editing this one file; nothing else changes.
- `app/airport-picker.tsx` — full-screen modal with a search field, listing "Name / (CODE) · City, Country". Title switches between "Flying from" / "Flying to" via a `field` route param.
- `src/state/routeSelection.ts` — tiny `useSyncExternalStore` module store holding origin/destination, so the picker (a separate route) hands its selection back without threading navigation params. Swap now operates on this store.
- `NavRow` added to `src/components/ui.tsx` for tappable iOS-style rows with a chevron.
- Verified: typecheck clean, picker searches by city ("new york" → JFK, LGA) and by code ("lax"), selections populate as "New York (JFK)", and a live search with picked airports still returns results. Zero console errors.
- Testing gotcha for future sessions: in Playwright, `text=` does NOT match placeholder attributes — use `getByPlaceholder()`. Cost a couple of false failures here.

## Next Steps

1. ~~Phone test~~ — **done 2026-08-20. Confirmed working on the user's real iPhone via Expo Go on SDK 54.** Stay on SDK 54 unless there's a strong reason to move; SDK 57 was rejected by their Expo Go.
   - For phone testing, `app/.env` points at the LAN IP `http://10.0.0.61:4000` instead of `localhost` (a phone's "localhost" is the phone itself). **Switch back to `http://localhost:4000` for web-only testing**, or update it when the machine's Wi-Fi IP changes — this is the most likely thing to break the phone setup later.
2. Deploy backend to Render free tier; point the app at the Render URL.
3. Optional polish: persist the theme choice, revisit `npm audit` findings before any real deployment.

## Session Log

### 2026-08-20 — Planning session
- Explored project directory (confirmed empty, fresh start).
- Clarified requirements with user: price comparison (not status tracking), SerpApi as provider, Expo/React Native, small backend required.
- Discovered Amadeus Self-Service API no longer available; pivoted to SerpApi Google Flights API.
- Wrote and got approval on full build plan (structure, provider integration, backend/frontend design, app-store path, verification stages).

### 2026-08-20 — Build session
- Scaffolded `server/` (Express/TS) and `app/` (Expo Router) per the plan.
- Mid-session scope additions from user: `.vscode/launch.json` for on-demand debugging; CSV-file-based cache instead of pure in-memory; Facebook-app-style design with light/dark toggle.
- Built full backend: env config, SerpApi provider module, CSV cache, date-range price search service, `/api/prices` + `/api/health` routes.
- Built full frontend: theme tokens/context, root layout with toggle, search screen, results screen.
- Hit and resolved a React 19 peer-dependency conflict installing `react-native-web`/`react-dom` for Expo web support (used `--legacy-peer-deps`).
- Removed a nested `.git` repo `create-expo-app` had created inside `app/`.
- Verified everything works: typechecked both projects clean, ran both dev servers, drove the web app with Playwright (chromium-cli wasn't available on this machine, used Playwright directly instead) — screenshots confirm light mode, dark mode, form validation, error state (expected 502 from placeholder API key), and the results screen (tested with mock data) all render correctly and match the intended design.
- Stopped both dev servers at the end of the session (ports 4000 and 8081 freed via `taskkill`, since `lsof` isn't available in this Windows Git Bash environment).
- Status: **Core app fully built and locally verified. Blocked only on the user obtaining a real SerpApi key to test live data.**

### 2026-08-20 — Live API key + iOS redesign session
- User added their real SerpApi key; verified live data works (JFK→LAX: $178/$178/$169, CSV cache written correctly).
- User rejected the Facebook-style design ("looks terrible") and asked for a pro iPhone app look, plus accounts, subscriptions, airline info, booking links, and user instructions. Gathered requirements over several rounds of questions and wrote a full design spec (see `docs/superpowers/specs/`).
- Key scope decision made while writing the spec: dropped the originally-planned "log every search as history" table in favor of a single `saved_routes` table written only when the user explicitly bookmarks a flight — simpler and closer to what was actually asked for.
- Implemented the whole spec: iOS design tokens + component kit, 4-tab navigation, Supabase auth context, saved-routes CRUD, restyled search/results, new flight-detail modal, new Saved/Account/Help screens, and the backend airline addition.
- Fixes along the way: installed `@expo/vector-icons` (not bundled in SDK 57), removed `headerLargeTitle` (Stack-only option, invalid on Tabs), and added safe-area padding to the tab bar after screenshots showed clipped labels.
- Verified via Playwright: all four tabs in light and dark, live search with real airline names, detail modal with Google Flights link, zero console errors.
- Status: **iOS redesign complete and verified. Blocked on the user creating a Supabase project before auth/saved-flights can be tested.**

### 2026-08-20 — Supabase wiring session
- Walked the user through creating the `cheapflights` Supabase project, running `supabase/saved_routes.sql` (new file, committed to the repo for reuse), and disabling email confirmation.
- Debugging note: first signup attempt failed with "Invalid API key" — the word "done" had been accidentally typed onto the end of the key in `app/.env`. Diagnosed by checking the key's length/tail rather than printing it. Re-pasted, restarted Expo (env vars only load at startup), and it worked.
- Verified the whole flow end-to-end with Playwright: signup → auto sign-in → live search → bookmark a flight → appears in Saved tab with airline and price → delete → removed. Zero console errors.
- Status: **All requested features are built and verified working locally. Next real milestone is testing on a physical phone via Expo Go, then deploying the backend.**

### 2026-08-20 — SDK 57 → 54 downgrade (for Expo Go compatibility)
- Expo Go on the user's iPhone rejected the project ("requires a newer version of Expo Go") even though `expo@57.0.15` is npm's `latest` stable. User chose to downgrade rather than chase an App Store update.
- Backed up `package.json` / `package-lock.json` as `*.sdk57-backup` first (no git repo to fall back on).
- `npx expo install --fix` rewrote `package.json` to SDK 54 versions but its own install failed on the same React peer conflict seen earlier; resolved with a clean `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`.
- Now on `expo@54.0.37`, `react-native@0.81.5`, `expo-router@6.0.24`, React 19.1.0.
- Two SDK-54 fixes needed: (1) `expo-status-bar` is not a config plugin in 54 (only from 57), so it was removed from `app.json` plugins — it was crashing startup; (2) SDK 54's types don't declare `process`, so `@types/node` was added and `"types": ["node"]` set in `tsconfig.json`.
- Also removed `@react-native-community/datetimepicker` entirely (dependency + plugin entry) — it was never used; dates are plain text inputs.
- Changed `userInterfaceStyle` from `"light"` to `"automatic"` in `app.json` so the dark theme works properly on a real device.
- Verified after downgrade: typecheck clean, Metro reports `sdkVersion 54.0.0`, iOS bundle compiles (8.0 MB, HTTP 200), and the full Playwright flow still passes (signup → search → save → Saved tab → delete, zero console errors).
