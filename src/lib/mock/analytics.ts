export interface ChannelPoint {
  day: string;
  blog: number;
  linkedin: number;
  x: number;
  reddit: number;
}

export interface SourceCount {
  source: string;
  count: number;
}

export interface SuccessPoint {
  day: string;
  rate: number;
}

export interface TopPiece {
  title: string;
  channel: string;
  views: number;
  ctr: number;
}

/** All analytics series are empty until a real data source is connected. */
export const publishedByChannel: ChannelPoint[] = [];
export const opportunityVolume: SourceCount[] = [];
export const agentSuccess: SuccessPoint[] = [];
export const topPieces: TopPiece[] = [];
