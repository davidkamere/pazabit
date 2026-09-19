import type { Arrival, Flag, Group, Message } from "../types";

export type ReportEvent = { kind: "report"; eventId: string; createdAt: number; body: string; flag: Flag; groups: string[]; arrival?: Arrival };
export type VoteEvent = { kind: "vote"; eventId: string; createdAt: number; reportId: string; direction: "up" | "down"; voterId: string };
export type EscalationEvent = { kind: "escalation"; eventId: string; createdAt: number; reportId: string; groups: string[] };
export type GroupCreatedEvent = { kind: "group-created"; eventId: string; createdAt: number; group: Group };
export type PazabitEvent = ReportEvent | VoteEvent | EscalationEvent | GroupCreatedEvent;

export type PazabitMeshState = { messages: Message[]; groups: Group[] };
