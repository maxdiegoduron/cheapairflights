# iOS Redesign, Accounts & Subscriptions — Design Spec

Status: Approved by user 2026-08-20. Implementation not yet started.
Git: this project has no git repo yet (user opted to hold off on git setup for now).

## Context

The app currently works end-to-end as a Facebook-web-styled single-flow tool: a search
form pushes to a results list, backed by a live SerpApi integration and a CSV price
cache (see `PROGRESS.md` for full history). The user tried it and asked for a
significant upgrade, gathered across several rounds of clarifying questions:

1. Visual redesign to feel like "a pro iPhone app," not a website.
2. User accounts (register/sign in), with Supabase handling auth + verification email.
3. A way to save ("subscribe to") specific flight results and remove them later, in
   its own bottom tab.
4. Tapping a result shows the airline and a free link to go book it.
5. A permanent Help screen with usage instructions.

## Goals

- The app feels native: tab bar navigation, large titles, inset grouped lists, real
  icons, translucent bars, light/dark support — all iOS-idiomatic.
- Accounts are real (Supabase Auth), but Express and the SerpApi integration are
  untouched other than returning one extra field (airline).
- Saving/unsubscribing a flight is cheap, simple, and explicit — only happens when the
  user taps the star, not automatically logged for every date checked (YAGNI: we were
  not asked for a search-history feature, only a subscriptions list).
- No new paid services. Supabase's free tier (Auth + Postgres) covers everything here.

## Non-goals (explicitly out of scope for this pass)

- Real-time price-drop email alerts (bigger feature, flagged as a future phase).
- Direct/precise airline booking links via SerpApi's `booking_token` flow (costs an
  extra API call per tap; we're using a free Google Flights deep link instead).
- A first-launch onboarding walkthrough (user chose a dedicated Help screen instead).
- Search history browsing (only explicitly-saved/subscribed flights are persisted).

## Architecture

No change to the Express backend's role: it remains the only thing holding the
`SERPAPI_KEY` secret, proxying `POST /api/prices`. It gains no auth logic and no
database dependency beyond its existing CSV price cache.

All accounts and subscriptions data flows **directly between the Expo app and
Supabase** (Auth + Postgres), using Supabase's JS client with Row Level Security so a
user can only ever read/write their own rows. This avoids re-implementing password
security ourselves and keeps Express small and single-purpose.

```
Expo app ──POST /api/prices──> Express ──> SerpApi (price + airline data)
Expo app ──auth + saved_routes CRUD──> Supabase (Auth + Postgres, RLS-scoped)
```

## Data Model (Supabase Postgres)

One table, `saved_routes` — created only when a user explicitly stars a result;
deleted only when they explicitly unsubscribe. No automatic history logging.

```sql
create table public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  flight_date date not null,
  price numeric not null,
  currency text not null default 'USD',
  airline text,
  created_at timestamptz not null default now()
);

alter table public.saved_routes enable row level security;

create policy "select own saved routes"
  on public.saved_routes for select
  using (auth.uid() = user_id);

create policy "insert own saved routes"
  on public.saved_routes for insert
  with check (auth.uid() = user_id);

create policy "delete own saved routes"
  on public.saved_routes for delete
  using (auth.uid() = user_id);
```

This SQL is meant to be pasted into the Supabase project's SQL editor by the user
during setup (documented in the implementation plan's verification steps).

## Backend Changes (`server/`)

Minimal. The only change is capturing which airline flew the cheapest option per date,
so the frontend can show it without a second API call.

- `providers/serpapi.ts`: `fetchCheapestPriceForDate` currently flattens all flight
  options to find `Math.min(price)`, losing which option that was. Change it to find
  the cheapest **flight option object** first (`reduce` by `.price`), then read both
  `price` and `flights[0].airline` off that same object. `ProviderPriceResult` gains
  an `airline: string | null` field.
- `services/csvCache.ts`: `CacheEntry` and the CSV header gain an `airline` column.
  Since this is disposable cache data (not user data), the existing
  `server/data/priceCache.csv` can simply be deleted once when this ships — no
  migration needed, a missing/old-format file is regenerated from scratch.
- No other backend changes. The Google Flights link itself is built client-side (it
  only needs origin/destination/date, which the frontend already has) — no backend
  involvement needed for that.

## Frontend Changes (`app/`)

### New dependencies

- `@supabase/supabase-js` — Supabase client.
- `@react-native-async-storage/async-storage` — session persistence on native (web
  uses `localStorage` automatically).
- `expo-blur` — translucent nav/tab bar.
- `@expo/vector-icons` (Ionicons) — already ships with Expo; used explicitly now for
  real icons instead of emoji.

### Navigation restructure

Move from a flat Stack (`index`, `results`) to a tab group plus stack overlays:

```
app/
├── _layout.tsx              # Root Stack: wraps in ThemeProvider + AuthProvider,
│                             # renders (tabs) group + results + flight-detail (modal)
├── (tabs)/
│   ├── _layout.tsx           # Tabs: Search, Subscriptions, Account, Help
│   ├── index.tsx             # Search (moved from app/index.tsx)
│   ├── subscriptions.tsx     # New
│   ├── account.tsx           # New
│   └── help.tsx               # New
├── results.tsx                # Existing, restyled; pushed from Search, tab bar hides
└── flight-detail.tsx          # New, presentation: "modal"
```

This is the standard Expo Router pattern for "tab bar app with occasional full-screen
pushes/modals" — `results` and `flight-detail` are siblings of the `(tabs)` group at
the root Stack level, so pushing them naturally covers the tab bar like a real iOS app.

### Design system (`src/theme/`)

Replace the current Facebook-inspired tokens with iOS-native ones:

- Colors: system blue `#007AFF` (light) / `#0A84FF` (dark) as the accent; iOS grouped
  background `#F2F2F7` (light) / `#000000` (dark); card surface `#FFFFFF` (light) /
  `#1C1C1E` (dark); label/secondary-label grays matching Apple's system palette.
- Typography: keep the system font (already correct — this is what makes it feel
  native), lean on iOS's large-title convention (`headerLargeTitle: true`).
- Components: inset grouped rows with hairline dividers replace the current boxy
  filled `TextInput` cards; `BlurView` behind the tab bar and nav bar; Ionicons
  (`airplane`, `calendar`, `star`/`star-outline`, `swap-horizontal`, `person`,
  `help-circle`, `sunny`/`moon`) replace emoji throughout.
- Light/dark toggle mechanism is unchanged (`ThemeContext`), just repointed at the new
  token values.

### Auth (`src/supabase/`)

- `client.ts`: `createClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, { auth: { storage: <AsyncStorage on native, undefined on web>, persistSession: true, autoRefreshToken: true } })`.
- `AuthContext.tsx`: provider exposing `{ session, user, loading, signIn, signUp, signOut }`, backed by `supabase.auth.onAuthStateChange` + `getSession()` on mount.
- New env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (anon key is safe client-side by design — Supabase's security boundary is RLS, not key secrecy). Added to `app/.env.example`.

### Screens

- **Search tab** (`(tabs)/index.tsx`): today's form, restyled to the new design
  system. Unchanged validation/behavior otherwise.
- **Results** (`results.tsx`): restyled rows; each row gets a star toggle (only
  interactive when signed in — signed-out tap prompts sign-in via a short alert/toast
  rather than blocking search) that inserts/deletes a `saved_routes` row. Tapping the
  row body (not the star) opens `flight-detail`.
- **Flight detail** (`flight-detail.tsx`, modal): shows date, price, airline, and a
  "View on Google Flights" button. Link is built as:
  `https://www.google.com/travel/flights?q=` +
  `encodeURIComponent(`Flights from ${origin} to ${destination} on ${date}`)`,
  opened via `Linking.openURL`.
- **Subscriptions tab** (`(tabs)/subscriptions.tsx`): lists the signed-in user's
  `saved_routes`, most recent first. Signed-out state shows a prompt to sign in
  instead of an empty list. Each row has a delete action (swipe-to-delete or a trash
  icon) that deletes the Supabase row; tapping the row opens `flight-detail` with that
  saved data.
- **Account tab** (`(tabs)/account.tsx`): signed-out shows a single auth screen with a
  mode toggle between "Sign in" and "Create account" (email + password fields, inline
  validation, loading state, error banner — same pattern as the existing search form's
  error handling). Signed-in shows the user's email and a sign-out button.
- **Help tab** (`(tabs)/help.tsx`): static screen, plain written sections — "Search for
  flights," "Save a flight," "Create an account" — explaining the app in the app's own
  voice. No dynamic content, no new backend involvement.

## Error Handling & Session

- Auth errors (bad credentials, weak password, etc.) surface via the same red-banner
  pattern already used on the search form.
- Session persists across restarts via AsyncStorage/localStorage; restored
  automatically on launch (brief loading state while `AuthContext` resolves).
- Recommend the user turn off "Confirm email" in Supabase's Auth settings for this
  test app, so sign-up logs in immediately — one dashboard toggle, reversible later.
  If left on, sign-up will require checking email before the session is created; the
  Account tab should handle that gracefully (show "check your email" state) rather
  than assume immediate sign-in.

## Testing / Verification Plan

1. Create a free Supabase project; run the `saved_routes` SQL above in its SQL editor;
   copy the project URL + anon key into `app/.env`.
2. `npx tsc --noEmit` in both `server/` and `app/` — must stay clean.
3. Local web smoke test (same Playwright-driven approach as the previous session):
   - Sign up a test account, confirm a row appears in Supabase's `auth.users`.
   - Run a search, star a result, confirm a row appears in `saved_routes`.
   - Open the Subscriptions tab, confirm it lists the saved flight.
   - Delete it from Subscriptions, confirm the row is gone from Supabase.
   - Tap a result to open the detail modal, confirm airline + working Google Flights
     link.
   - Check Help tab renders.
   - Check both light and dark themes across all four tabs.
   - Sign out, confirm Account/Subscriptions correctly show signed-out states.
4. Screenshot each tab in both themes as before, for visual confirmation.

## Open Items for the User

- Create the free Supabase project and provide the URL + anon key (or confirm you'll
  drop them into `app/.env` yourself, same pattern as the SerpApi key).
- Decide whether to keep Supabase's "Confirm email" requirement on or off (recommended
  off for this test app).
