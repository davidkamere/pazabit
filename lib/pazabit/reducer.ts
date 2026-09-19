import type { PazabitEvent, PazabitMeshState } from "../../domain/pazabit-events";

export function applyPazabitEvent(state: PazabitMeshState, event: PazabitEvent): PazabitMeshState {
  switch (event.kind) {
    case "report": return { ...state, messages: [{ id: event.eventId, time: "now", body: event.body, flag: event.flag, upvotes: 0, downvotes: 0, groups: event.groups, arrival: event.arrival, voiceSeconds: event.audio?.durationSec }, ...state.messages] };
    case "vote": return { ...state, messages: state.messages.map(message => message.id === event.reportId ? { ...message, upvotes: message.upvotes + (event.direction === "up" ? 1 : 0), downvotes: message.downvotes + (event.direction === "down" ? 1 : 0) } : message) };
    case "escalation": return { ...state, messages: state.messages.map(message => message.id === event.reportId ? { ...message, groups: [...new Set([...message.groups, ...event.groups])], arrival: message.flag === "urgent" ? "direct" : "community" } : message) };
    case "group-created": return state.groups.some(group => group.id === event.group.id) ? state : { ...state, groups: [...state.groups, event.group] };
  }
}
