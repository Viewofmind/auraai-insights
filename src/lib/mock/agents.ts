import {
  Search,
  Globe,
  PenLine,
  MessageCircle,
  Twitter,
  Linkedin,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AgentStatus = "live" | "paused" | "error";

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  status: AgentStatus;
  runsToday: number;
  successRate: number; // 0-100
  avgLatencyMs: number;
  lastActivity: string;
  lastActivityAt: string; // e.g. "2m ago"
  spark: number[];
  accent: "emerald" | "cyan" | "amber" | "rose" | "violet";
}

export const agents: Agent[] = [
  {
    id: "seo",
    name: "SEO Agent",
    role: "Keyword discovery & on-page briefs",
    icon: Search,
    status: "live",
    runsToday: 42,
    successRate: 98.2,
    avgLatencyMs: 1240,
    lastActivity: "Generated 4 keyword clusters for 'small-cap value'",
    lastActivityAt: "2m ago",
    spark: [12, 18, 14, 22, 28, 26, 34],
    accent: "emerald",
  },
  {
    id: "geo",
    name: "GEO Agent",
    role: "Answer-engine visibility (ChatGPT, Perplexity)",
    icon: Globe,
    status: "live",
    runsToday: 18,
    successRate: 94.5,
    avgLatencyMs: 2100,
    lastActivity: "Ranked #2 on Perplexity for 'best NSE screener'",
    lastActivityAt: "7m ago",
    spark: [4, 8, 6, 10, 12, 14, 18],
    accent: "cyan",
  },
  {
    id: "content-writer",
    name: "Content Writer",
    role: "Long-form drafts & investor briefs",
    icon: PenLine,
    status: "live",
    runsToday: 11,
    successRate: 96.0,
    avgLatencyMs: 8400,
    lastActivity: "Drafted 'Q3 FY26 IT sector outlook' — 1,840 words",
    lastActivityAt: "12m ago",
    spark: [2, 4, 3, 6, 8, 7, 11],
    accent: "emerald",
  },
  {
    id: "reddit",
    name: "Reddit Agent",
    role: "Signal mining across r/IndianStockMarket",
    icon: MessageCircle,
    status: "live",
    runsToday: 63,
    successRate: 91.3,
    avgLatencyMs: 980,
    lastActivity: "Flagged thread on DMart Q2 — 240 comments/hr",
    lastActivityAt: "just now",
    spark: [20, 24, 22, 30, 28, 40, 46],
    accent: "amber",
  },
  {
    id: "x",
    name: "X Agent",
    role: "Cashtag monitoring & thread drafting",
    icon: Twitter,
    status: "paused",
    runsToday: 0,
    successRate: 88.7,
    avgLatencyMs: 1550,
    lastActivity: "Paused by operator — awaiting review",
    lastActivityAt: "1h ago",
    spark: [14, 12, 10, 8, 6, 4, 2],
    accent: "cyan",
  },
  {
    id: "linkedin",
    name: "LinkedIn Agent",
    role: "Thought-leadership posts & carousels",
    icon: Linkedin,
    status: "live",
    runsToday: 7,
    successRate: 97.4,
    avgLatencyMs: 3200,
    lastActivity: "Scheduled 3 posts on AI-in-finance thesis",
    lastActivityAt: "22m ago",
    spark: [1, 3, 2, 4, 5, 6, 7],
    accent: "cyan",
  },
  {
    id: "tech-seo",
    name: "Technical SEO Agent",
    role: "Crawl, schema & Core Web Vitals",
    icon: Wrench,
    status: "error",
    runsToday: 3,
    successRate: 74.2,
    avgLatencyMs: 5600,
    lastActivity: "Sitemap fetch failed — 502 from investsights.in/sitemap.xml",
    lastActivityAt: "4m ago",
    spark: [10, 8, 12, 6, 4, 3, 2],
    accent: "rose",
  },
];
