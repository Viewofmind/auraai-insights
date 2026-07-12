export interface ActivityEvent {
  id: string;
  agent: string;
  message: string;
  at: string;
  kind: "success" | "info" | "warn" | "error";
}

export const activity: ActivityEvent[] = [
  { id: "a1", agent: "Reddit Agent", message: "Flagged trending thread on DMART Q2 — 240 comments/hr", at: "just now", kind: "success" },
  { id: "a2", agent: "SEO Agent", message: "Generated 4 keyword clusters for 'small-cap value'", at: "2m ago", kind: "info" },
  { id: "a3", agent: "Technical SEO Agent", message: "Sitemap fetch failed — retrying with backoff", at: "4m ago", kind: "error" },
  { id: "a4", agent: "GEO Agent", message: "Ranked #2 on Perplexity for 'best NSE screener'", at: "7m ago", kind: "success" },
  { id: "a5", agent: "Content Writer", message: "Drafted 'Q3 FY26 IT sector outlook' (1,840 words)", at: "12m ago", kind: "info" },
  { id: "a6", agent: "LinkedIn Agent", message: "Scheduled 3 posts on AI-in-finance thesis", at: "22m ago", kind: "success" },
  { id: "a7", agent: "X Agent", message: "Paused by operator — awaiting review", at: "1h ago", kind: "warn" },
  { id: "a8", agent: "SEO Agent", message: "Published brief: 'Reading Indian balance sheets'", at: "2h ago", kind: "success" },
];
