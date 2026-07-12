
# AuraAI-CMO Dashboard — Plan

A premium, dark-mode AI marketing command center for InvestSights.in, inspired by Okara.ai's agent-first UX but tuned for a serious finance/tech aesthetic. Built on this project's TanStack Start + Tailwind + shadcn/ui stack. All data is realistic mock data (no backend this pass).

## Visual Direction

- **Palette (dark-only):** Deep navy base `oklch(0.16 0.03 250)`, elevated surface `oklch(0.20 0.03 250)`, hairline borders at 8% white, emerald primary `oklch(0.72 0.17 155)`, cyan/electric-blue accent `oklch(0.75 0.14 220)`, amber warning, rose destructive. Subtle emerald glow on active/live states.
- **Typography:** `Inter` for UI, `JetBrains Mono` for numbers/tickers/status codes (loaded via `<link>` in `__root.tsx`).
- **Feel:** Terminal-inspired but elegant — tight grid, mono numerals, thin 1px dividers, restrained motion (fade/scale on mount, pulsing dot for LIVE agents, shimmer on skeletons).
- Tokens defined in `src/styles.css` under `:root` (dark applied by default via `<html class="dark">`).

## Layout Shell

Root layout in `__root.tsx` wraps authenticated app in a `SidebarProvider` + shell:

- **Left Sidebar** (`collapsible="icon"`): logo lockup "AuraAI · CMO", nav groups — Overview, Agents Hub, Content Studio, Opportunities, Analytics. Collapses to icon rail with tooltips.
- **Top Bar:** global command search (⌘K styled input), environment pill (`PROD · investsights.in`), notifications bell w/ dot, user avatar menu.
- **Main:** page container with breadcrumb + page title row, then content.

## Routes

```text
src/routes/
  __root.tsx              // shell provider + fonts + dark class
  index.tsx               // Dashboard
  agents.tsx              // Agents Hub
  agents.$agentId.tsx     // Agent detail drawer-route (optional stretch)
  content.tsx             // Content Studio
  opportunities.tsx       // Opportunities Feed
  analytics.tsx           // Analytics
```

Each route sets its own `head()` (title + description + og).

## Pages

### 1. Dashboard (`/`)
- Hero KPI strip (4 cards): Active Agents, Opportunities Today, Drafts Pending Review, Est. Reach (7d) — mono numerals, small delta chip.
- **Live Agent Status** panel: horizontal list of 7 agents with pulsing status dot (running / idle / error), last-run timestamp, throughput sparkline.
- **Recent Opportunities** table (5 rows): source, title, score, action.
- **Activity Feed** timeline: agent events (e.g. "SEO Agent published 3 briefs", "Reddit Agent flagged r/investing thread").

### 2. Agents Hub (`/agents`) — main focus
- Grid of 7 agent cards, each with:
  - Icon + name + one-line role
  - Status chip (Live / Paused / Error) with animated dot
  - Metrics row: runs today, success rate, avg latency
  - Last activity line ("2m ago — Generated 4 keyword clusters")
  - Mini 7-day sparkline
  - Quick actions: **Run now**, **Configure**, **View logs**
- Agents: SEO, GEO, Content Writer, Reddit, X, LinkedIn, Technical SEO.
- Filter chips: All / Live / Paused / Error. Search input.
- Empty state design for filtered-no-results.

### 3. Content Studio (`/content`)
- Two-pane: left = drafts list (title, agent source, status: Draft/In Review/Approved/Published, updated), right = preview pane with markdown-styled body, meta sidebar (target keyword, channel, agent), and approval workflow buttons (Request changes / Approve / Publish).
- Filters by channel (Blog, LinkedIn, X, Reddit) and status.
- Empty state: "No drafts yet — spin up the Content Writer Agent".

### 4. Opportunities Feed (`/opportunities`)
- Stacked cards grouped by source (Reddit, Keywords, GEO, X mentions).
- Each opportunity: source icon, title/snippet, score bar (0–100), tags, detected-at, actions (Assign to agent / Dismiss / Open).
- Right rail: filter by source, min score slider, tag multiselect.

### 5. Analytics (`/analytics`)
- KPI row.
- Charts (Recharts): area chart of content published per channel (30d), bar chart of opportunity volume by source, line chart of agent success rate, table of top-performing pieces.
- Time range selector (7d / 30d / 90d).

## Components

New reusable pieces in `src/components/`:

- `app-shell/AppSidebar.tsx`, `TopBar.tsx`, `Breadcrumbs.tsx`
- `agents/AgentCard.tsx`, `AgentStatusDot.tsx`, `Sparkline.tsx`
- `dashboard/KpiCard.tsx`, `ActivityFeed.tsx`, `LiveAgentsPanel.tsx`
- `content/DraftList.tsx`, `DraftPreview.tsx`
- `opportunities/OpportunityCard.tsx`
- `common/EmptyState.tsx`, `SectionHeader.tsx`, `StatusPill.tsx`
- Mock data in `src/lib/mock/{agents,opportunities,drafts,activity,analytics}.ts`

Uses existing shadcn primitives (sidebar, card, button, badge, input, table, tabs, tooltip, dropdown-menu, dialog, sheet, slider, select). Install `recharts` (already common) and `lucide-react` icons.

## Motion & Polish

- Cards: `animate-fade-in` on mount, subtle `hover:translate-y-[-1px]` + border glow.
- Status dot: CSS pulse (emerald for live, amber paused, rose error).
- Sparklines: SVG polylines, no library.
- Command palette styling on top-bar search (no functionality this pass).
- All empty states get an icon, one-line pitch, and a primary CTA.

## Out of Scope (this pass)

- Real agent execution / backend
- Auth (single-tenant demo view)
- Working ⌘K palette logic and real search
- Persisting draft approvals

## Deliverables Checklist

- [ ] Design tokens + fonts wired in `styles.css` / `__root.tsx`
- [ ] Sidebar + top bar shell
- [ ] 5 routes with distinct `head()` metadata
- [ ] Agents Hub polished (primary showcase)
- [ ] Mock data files
- [ ] Empty + loading states across pages
