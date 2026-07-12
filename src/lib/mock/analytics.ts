export const publishedByChannel = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const seed = Math.sin(i * 1.3) * 3;
  return {
    day: `D${day}`,
    blog: Math.max(0, Math.round(2 + seed + Math.random() * 2)),
    linkedin: Math.max(0, Math.round(3 + seed + Math.random() * 3)),
    x: Math.max(0, Math.round(5 + seed + Math.random() * 4)),
    reddit: Math.max(0, Math.round(1 + Math.random() * 2)),
  };
});

export const opportunityVolume = [
  { source: "Reddit", count: 132 },
  { source: "Keywords", count: 98 },
  { source: "GEO", count: 64 },
  { source: "X", count: 210 },
];

export const agentSuccess = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  rate: Math.round(88 + Math.sin(i / 2) * 4 + Math.random() * 3),
}));

export const topPieces = [
  { title: "Why 'best NSE screener' is a GEO opportunity", channel: "Blog", views: 12840, ctr: 6.4 },
  { title: "DMART Q2: the beat and the margin story", channel: "LinkedIn", views: 8420, ctr: 4.9 },
  { title: "How to read a balance sheet (India edition)", channel: "Blog", views: 7210, ctr: 5.1 },
  { title: "$HDFCAMC — split thread", channel: "X", views: 5240, ctr: 3.2 },
  { title: "Q3 FY26 IT outlook — margins & attrition", channel: "Blog", views: 4180, ctr: 4.4 },
];
