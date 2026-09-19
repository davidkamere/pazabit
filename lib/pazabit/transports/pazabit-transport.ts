import { PazabitEvent, PazabitMeshState, AudioAttachment } from "@/domain/pazabit-events";

export type MeshConnectionState = "connecting" | "connected" | "disconnected";
export type PazabitTransport = {
  publish(event: PazabitEvent): void;
  subscribe(
    onState: (state: PazabitMeshState) => void,
    onConnection: (state: MeshConnectionState) => void,
    onFeedback: (message: { title: string; detail: string }) => void,
  ): () => void;
  fetchAudio(messageId: string): Promise<AudioAttachment | null>;
  verifyGroupPassword(groupId: string, password: string): Promise<boolean>;
};