import { io } from "socket.io-client";
import { PazabitEvent, PazabitMeshState, AudioAttachment } from "@/domain/pazabit-events";
import { MeshConnectionState, PazabitTransport } from "./pazabit-transport";

/** Android replaces this with BitchatTransport and `PAZABIT_EVENT` packets. */
export function createSocketIoPazabitTransport(): PazabitTransport & {
  fetchAudio: (messageId: string) => Promise<AudioAttachment | null>;
} {
  const socket = io();
  const pendingAudio = new Map<string, { resolve: (value: AudioAttachment | null) => void }>();
  const pendingGroupVerify = new Map<string, { resolve: (value: boolean) => void }>();

  socket.on("pazabit:audio:response", ({ messageId, audio }: { messageId: string; audio: AudioAttachment }) => {
    const pending = pendingAudio.get(messageId);
    if (pending) {
      pending.resolve(audio);
      pendingAudio.delete(messageId);
    }
  });

  socket.on("pazabit:group:verify:response", ({ groupId, ok }: { groupId: string; ok: boolean }) => {
    const pending = pendingGroupVerify.get(groupId);
    if (pending) {
      pending.resolve(ok);
      pendingGroupVerify.delete(groupId);
    }
  });

  return {
    publish: (event: PazabitEvent) => socket.emit("pazabit:event", event),
    subscribe: (onState, onConnection, onFeedback) => {
      socket.on("connect", () => onConnection("connected"));
      socket.on("disconnect", () => onConnection("disconnected"));
      socket.on("pazabit:state", (state: PazabitMeshState) => onState(state));
      socket.on("pazabit:feedback", onFeedback);
      onConnection("connecting");
      return () => socket.close();
    },
    fetchAudio: (messageId: string) =>
      new Promise<AudioAttachment | null>((resolve) => {
        pendingAudio.set(messageId, { resolve });
        socket.emit("pazabit:audio:request", messageId);
        setTimeout(() => {
          if (pendingAudio.has(messageId)) {
            pendingAudio.get(messageId)!.resolve(null);
            pendingAudio.delete(messageId);
          }
        }, 5000);
      }),
    verifyGroupPassword: (groupId: string, password: string) =>
      new Promise<boolean>((resolve) => {
        pendingGroupVerify.set(groupId, { resolve });
        socket.emit("pazabit:group:verify", { groupId, password });
        setTimeout(() => {
          if (pendingGroupVerify.has(groupId)) {
            pendingGroupVerify.get(groupId)!.resolve(false);
            pendingGroupVerify.delete(groupId);
          }
        }, 5000);
      }),
  };
}