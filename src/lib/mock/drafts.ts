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

export const drafts: Draft[] = [];
