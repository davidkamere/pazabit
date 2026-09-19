import { io } from "socket.io-client";
import { PazabitEvent, PazabitMeshState } from "@/domain/pazabit-events";
import { MeshConnectionState, PazabitTransport } from "./pazabit-transport";

/** Android replaces this with BitchatTransport and `PAZABIT_EVENT` packets. */
export function createSocketIoPazabitTransport(): PazabitTransport {
  const socket = io();
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
  };
}
