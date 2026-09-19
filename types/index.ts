export type Flag = "urgent" | "ongoing" | null;
export type Arrival = "direct" | "community";

export type Group = {
  id: string;
  tag: string;
  members: number;
  status: "connected" | "locked";
  description: string;
};
export type Message = {
  id: string;
  time: string;
  body: string;
  flag: Flag;
  upvotes: number;
  downvotes: number;
  groups: string[];
  arrival?: Arrival;
  voiceSeconds?: number;
  voted?: "up" | "down";
};
export type Toast = { id: string; title: string; detail: string };
