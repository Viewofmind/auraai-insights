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

/** No fabricated signals: the real feed comes from the backend listening endpoints. */
export const opportunities: Opportunity[] = [];
