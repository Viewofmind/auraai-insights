export type OpportunitySource = "reddit" | "keyword" | "geo" | "x";

export interface Opportunity {
  id: string;
  source: OpportunitySource;
  title: string;
  snippet: string;
  score: number; // 0-100
  tags: string[];
  detectedAt: string;
  url?: string;
}

export const opportunities: Opportunity[] = [
  {
    id: "op-1",
    source: "reddit",
    title: "r/IndianStockMarket — 'Is HDFC AMC still a buy after the split?'",
    snippet:
      "Thread trending at 240 comments/hr. Sentiment mixed. Retail investors asking for a fundamentals breakdown.",
    score: 92,
    tags: ["HDFC AMC", "AMC sector", "Q2 FY26"],
    detectedAt: "3m ago",
  },
  {
    id: "op-2",
    source: "keyword",
    title: "Rising query: 'best small-cap mutual funds 2026'",
    snippet: "Search volume +180% MoM in IN. Low competition score (24). No top-3 InvestSights coverage.",
    score: 88,
    tags: ["small-cap", "mutual funds", "SEO"],
    detectedAt: "18m ago",
  },
  {
    id: "op-3",
    source: "geo",
    title: "Perplexity cites competitor for 'NSE screener'",
    snippet: "InvestSights not surfaced. Recommend publishing a canonical screener comparison brief.",
    score: 84,
    tags: ["Perplexity", "GEO", "screener"],
    detectedAt: "42m ago",
  },
  {
    id: "op-4",
    source: "x",
    title: "$DMART trending — 12k mentions in 2h",
    snippet: "Q2 results beat consensus. Analyst threads gaining traction. Draft-ready commentary suggested.",
    score: 81,
    tags: ["DMART", "earnings", "X"],
    detectedAt: "1h ago",
  },
  {
    id: "op-5",
    source: "reddit",
    title: "r/investing_india — 'What is GEO and why should retail care?'",
    snippet: "Emerging topic. Educational content gap. Content Writer + GEO Agent recommended.",
    score: 76,
    tags: ["education", "GEO"],
    detectedAt: "2h ago",
  },
  {
    id: "op-6",
    source: "keyword",
    title: "Query gap: 'how to read a balance sheet Indian companies'",
    snippet: "3,600 searches/mo. Top result is 6 years old. High refresh opportunity.",
    score: 72,
    tags: ["fundamentals", "education"],
    detectedAt: "3h ago",
  },
  {
    id: "op-7",
    source: "geo",
    title: "ChatGPT answers 'top Indian fintechs' without citation",
    snippet: "Zero source attribution. Publish a structured comparison to become the referenced source.",
    score: 69,
    tags: ["ChatGPT", "fintech"],
    detectedAt: "5h ago",
  },
];
