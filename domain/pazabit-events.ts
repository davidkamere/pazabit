import type { Arrival, Flag, Group, Message } from "../types";

export type AudioAttachment = {
  data: ArrayBuffer;
  durationSec: number;
  mimeType: string;
};
export type ReportEvent = {
  kind: "report";
  eventId: string;
  createdAt: number;
  body: string;
  flag: Flag;
  groups: string[];
  arrival?: Arrival;
  audio?: AudioAttachment;
};
export type VoteEvent = {
  kind: "vote";
  eventId: string;
  createdAt: number;
  reportId: string;
  direction: "up" | "down";
  voterId: string;
};
export type EscalationEvent = {
  kind: "escalation";
  eventId: string;
  createdAt: number;
  reportId: string;
  groups: string[];
};
export type GroupCreatedEvent = {
  kind: "group-created";
  eventId: string;
  createdAt: number;
  group: Group;
  password: string;
};
export type PazabitEvent =
  | ReportEvent
  | VoteEvent
  | EscalationEvent
  | GroupCreatedEvent;

export type PazabitMeshState = { messages: Message[]; groups: Group[] };
export type AudioStore = Map<string, AudioAttachment>;
