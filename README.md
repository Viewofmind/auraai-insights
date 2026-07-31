# AuraAI-CMO — Frontend (auraai-insights)

Dashboard UI for InvestSights.in content operations: agents hub, content queue,
compliance review, audit log, and integrations.

## What this is

A **pure UI layer**. There is no business logic, no database, and no AI
orchestration in this repo. Every piece of state that matters — content items,
the state machine, compliance decisions, audit entries, integrations — lives in
**aura-cmo-backend** and is reached over its REST API (`/api/v1/*`).

This frontend only:

- renders backend responses,
- sends user actions back as API calls,
- shows explicit `loading` / `data` / `not connected` states.

Stack: TanStack Start (React 19, file-based routing), TypeScript, Tailwind CSS v4,
shadcn/ui, TanStack Query.

## API contract

All calls go through `src/lib/api/` :

- `config.ts` — base URL + endpoint map
- `client.ts` — `apiFetch`, attaches `Authorization: Bearer <token>`
- `hooks.ts` — typed React Query hooks
- `types.ts` — response shapes

The base URL is read from `VITE_API_BASE_URL` and is **never hardcoded**. With it
unset, the app renders "No backend configured" everywhere instead of fake data.

## Running locally

```bash
bun install                      # or: npm install
echo 'VITE_API_BASE_URL=http://localhost:8000' > .env
bun run dev                      # http://localhost:8080
```

Then open `/login` and paste a backend access token — it is stored locally and
sent as a bearer token on every request.

Other scripts: `bun run build`, `bun run lint`, `bun run format`.

## Security note — do not expose publicly

This app **must not be published or made publicly reachable until
aura-cmo-backend is properly secured**. Known limitations today:

- The API key is entered by the user and kept in `localStorage`, readable by any
  script on the origin. Acceptable stopgap for a single-admin internal tool;
  **not** a long-term pattern. The proper flow is a backend session cookie or a
  short-lived token exchange.
- Roles in the UI (including the `kruti` compliance context) are a client-side
  shell only. They are **not** an authorization boundary — the backend must
  enforce every permission itself.
- There is no rate limiting, CSRF protection, or audit of client actions here.

Treat this as an internal tool behind access control until backend auth,
authorization, and CORS are locked down.
