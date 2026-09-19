import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { initialMessages, groups } from "./lib/constants";
import { applyPazabitEvent } from "./lib/pazabit/reducer";
import type { PazabitEvent, PazabitMeshState, AudioAttachment, AudioStore } from "./domain/pazabit-events";
import type { Group } from "./types";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();
const port = Number(process.env.PORT ?? 3000);

let meshState: PazabitMeshState = { messages: initialMessages, groups };
const socketVotes = new Map<string, Map<string, "up" | "down">>();
const audioStore: AudioStore = new Map();
const groupPasswords = new Map<string, string>(); // groupId -> password

// Initialize passwords for seed groups
for (const g of groups) {
  if (g.status === "locked") {
    groupPasswords.set(g.id, "demo123"); // demo password for locked seed groups
  }
}

void app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.emit("pazabit:state", meshState);

    socket.on("pazabit:event", (event: PazabitEvent) => {
      if (event.kind === "vote") {
        const votes = socketVotes.get(socket.id) ?? new Map();
        const previous = votes.get(event.reportId);
        if (previous === event.direction) votes.delete(event.reportId);
        else votes.set(event.reportId, event.direction);
        socketVotes.set(socket.id, votes);
        meshState = meshState.messages.some((message) => message.id === event.reportId)
          ? {
              ...meshState,
              messages: meshState.messages.map((message) => {
                if (message.id !== event.reportId) return message;
                if (previous === event.direction)
                  return {
                    ...message,
                    upvotes: message.upvotes - (event.direction === "up" ? 1 : 0),
                    downvotes: message.downvotes - (event.direction === "down" ? 1 : 0),
                  };
                return {
                  ...message,
                  upvotes:
                    message.upvotes +
                    (event.direction === "up" ? 1 : previous === "up" ? -1 : 0),
                  downvotes:
                    message.downvotes +
                    (event.direction === "down" ? 1 : previous === "down" ? -1 : 0),
                };
              }),
            }
          : meshState;
      } else {
        if (event.kind === "report" && event.audio) {
          audioStore.set(event.eventId, event.audio);
        }
        if (event.kind === "group-created" && event.password) {
          groupPasswords.set(event.group.id, event.password);
        }
        meshState = applyPazabitEvent(meshState, event);
      }
      io.emit("pazabit:state", meshState);
      if (event.kind === "report" && event.groups.length)
        socket.emit("pazabit:feedback", {
          title: "Report delivered",
          detail: `Your report was delivered to ${event.groups.join(" and ")}.`,
        });
      if (event.kind === "escalation")
        socket.emit("pazabit:feedback", {
          title: "Report delivered",
          detail: `The report was delivered to ${event.groups.join(" and ")}.`,
        });
      if (event.kind === "group-created")
        socket.emit("pazabit:feedback", {
          title: "Private group created",
          detail: `${event.group.tag} is ready for encrypted coordination.`,
        });
    });

    socket.on("pazabit:group:verify", ({ groupId, password }: { groupId: string; password: string }) => {
      const stored = groupPasswords.get(groupId);
      const ok = stored && stored === password;
      socket.emit("pazabit:group:verify:response", { groupId, ok });
    });

    socket.on("pazabit:audio:request", (messageId: string) => {
      const audio = audioStore.get(messageId);
      if (audio) {
        socket.emit("pazabit:audio:response", { messageId, audio });
      }
    });

    socket.on("disconnect", () => socketVotes.delete(socket.id));
  });

  httpServer.listen(port, () => console.log(`Pazabit mesh relay ready on http://localhost:${port}`));
});