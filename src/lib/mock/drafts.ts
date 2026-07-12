export type DraftStatus = "draft" | "in_review" | "approved" | "published";
export type DraftChannel = "blog" | "linkedin" | "x" | "reddit";

export interface Draft {
  id: string;
  title: string;
  channel: DraftChannel;
  status: DraftStatus;
  agent: string;
  targetKeyword: string;
  updatedAt: string;
  wordCount: number;
  body: string;
}

export const drafts: Draft[] = [
  {
    id: "d-1",
    title: "Q3 FY26 IT Sector Outlook: Margins, Deal Wins & Attrition",
    channel: "blog",
    status: "in_review",
    agent: "Content Writer",
    targetKeyword: "indian IT sector Q3 FY26",
    updatedAt: "12m ago",
    wordCount: 1840,
    body:
      "Indian IT services enter Q3 FY26 with a cautious optimism. Guidance from top-tier vendors suggests deal TCVs are stabilizing after four soft quarters, though discretionary spend remains uneven across BFSI and hi-tech verticals.\n\nMargin pressure has eased slightly as attrition normalizes to the low double digits. Pyramid rationalization and utilization gains — not pricing — are doing the heavy lifting.\n\nWhat to watch:\n- Deal TCV disclosures from the top 5\n- Net headcount adds (a leading indicator)\n- BFSI vertical commentary from US regionals\n- Gen-AI monetization: still narrative, but the delta is real",
  },
  {
    id: "d-2",
    title: "How to Read a Balance Sheet: A Retail Investor's Field Guide",
    channel: "blog",
    status: "draft",
    agent: "Content Writer",
    targetKeyword: "how to read a balance sheet indian companies",
    updatedAt: "38m ago",
    wordCount: 2110,
    body:
      "A balance sheet is a photograph, not a movie. It tells you what a company owns, what it owes, and what shareholders are left with — at one instant in time.\n\nStart with three questions:\n1. Is the company solvent? (Assets > Liabilities)\n2. Is it liquid? (Current assets vs current liabilities)\n3. Is it efficient? (How is capital deployed?)\n\nWe'll walk through Nestlé India's most recent filing to make this concrete.",
  },
  {
    id: "d-3",
    title: "DMART Q2: The beat, the margin story, and what it means for FY26",
    channel: "linkedin",
    status: "approved",
    agent: "LinkedIn Agent",
    targetKeyword: "DMART Q2 results",
    updatedAt: "1h ago",
    wordCount: 320,
    body:
      "DMART's Q2 print beat consensus on both revenue and EBITDA margin — a rare double in a quarter where FMCG peers guided caution.\n\nThree signals worth pinning:\n→ Same-store sales growth accelerated to 8.4%\n→ Gross margin held at 14.9% despite input inflation\n→ Store adds tracking above plan (11 net new)\n\nThe read-across for organized retail is constructive, but valuations already reflect much of it. Watching Nov footfall data next.",
  },
  {
    id: "d-4",
    title: "$HDFCAMC — quick thread on the split and what it changes (spoiler: not much)",
    channel: "x",
    status: "draft",
    agent: "X Agent",
    targetKeyword: "HDFC AMC stock split",
    updatedAt: "2h ago",
    wordCount: 210,
    body:
      "1/ HDFC AMC's stock split ≠ a fundamental event. It's a liquidity nudge.\n\n2/ Nothing changes about AUM, fee tier mix, or SIP momentum. The float widens; the pie doesn't grow.\n\n3/ The real story is still: fee compression is a slow bleed, but SIP inflows are compounding. Watch the ratio.",
  },
  {
    id: "d-5",
    title: "Why 'best NSE screener' is a GEO opportunity, not a keyword one",
    channel: "blog",
    status: "published",
    agent: "GEO Agent",
    targetKeyword: "best NSE screener",
    updatedAt: "1d ago",
    wordCount: 1420,
    body:
      "Traditional SEO plays the 10 blue links. GEO plays the one paragraph the LLM cites. For a query like 'best NSE screener,' the difference is everything.\n\nWe reverse-engineered how Perplexity and ChatGPT currently answer this query, and where InvestSights can slot in as the canonical source.",
  },
];
