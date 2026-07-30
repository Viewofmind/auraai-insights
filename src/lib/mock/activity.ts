export interface ActivityEvent {
  id: string;
  agent: string;
  message: string;
  at: string;
  kind: "success" | "info" | "warn" | "error";
}

/** No activity is streamed until agents are connected to a real data source. */
export const activity: ActivityEvent[] = [];
