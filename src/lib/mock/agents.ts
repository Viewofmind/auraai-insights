import {
  Search,
  Globe,
  PenLine,
  MessageCircle,
  Twitter,
  Linkedin,
  Wrench,
  Newspaper,
  Users,

  type LucideIcon,
} from "lucide-react";

export type AgentStatus = "live" | "paused" | "error" | "disconnected";

export interface AgentMetrics {
  runsToday: number;
  successRate: number; // 0-100
  avgLatencyMs: number;
  spark: number[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  status: AgentStatus;
  /** null until the agent is connected to a live data source */
  metrics: AgentMetrics | null;
  lastActivity: string | null;
  lastActivityAt: string | null;
  accent: "emerald" | "cyan" | "amber" | "rose" | "violet";
}

/**
 * Configured agents. No data source is wired up yet, so every agent is
 * reported as `disconnected` with null metrics — never fabricated numbers.
 */
export const agents: Agent[] = [
  {
    id: "seo",
    name: "SEO Agent",
    role: "Keyword discovery & on-page briefs",
    icon: Search,
    status: "disconnected",
    metrics: null,
    lastActivity: null,
    lastActivityAt: null,
    accent: "emerald",
  },
  {
    id: "content-writer",
    name: "Content Writer",
    role: "Long-form drafts & investor briefs",
    icon: PenLine,
    status: "disconnected",
    metrics: null,
    lastActivity: null,
    lastActivityAt: null,
    accent: "cyan",
  },
];

export interface UpcomingAgent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
}

/** Not built yet — shown as a locked "Coming in Phase 2" section. */
export const phase2Agents: UpcomingAgent[] = [
  {
    id: "geo",
    name: "GEO Agent",
    role: "Answer-engine visibility (ChatGPT, Perplexity)",
    icon: Globe,
  },
  {
    id: "reddit",
    name: "Reddit Agent",
    role: "Signal mining across investing subreddits",
    icon: MessageCircle,
  },
  {
    id: "x",
    name: "X Agent",
    role: "Cashtag monitoring & thread drafting",
    icon: Twitter,
  },
  {
    id: "linkedin",
    name: "LinkedIn Agent",
    role: "Thought-leadership posts & carousels",
    icon: Linkedin,
  },
  {
    id: "hacker-news",
    name: "Hacker News Agent",
    role: "Launch & fintech discussion monitoring",
    icon: Newspaper,
  },
  {
    id: "ugc",
    name: "UGC Agent",
    role: "Community-sourced content sourcing & vetting",
    icon: Users,
  },
  {
    id: "tech-seo",
    name: "Technical SEO Agent",
    role: "Crawl, schema & Core Web Vitals",
    icon: Wrench,
  },
];

