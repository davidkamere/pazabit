"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Message, Toast, Flag } from "@/types";
import { groups as seedGroups, initialMessages } from "@/lib/constants";
import { PazabitEvent } from "@/domain/pazabit-events";
import { createSocketIoPazabitTransport } from "@/lib/pazabit/transports/socket-io-pazabit-transport";
import { MeshConnectionState, PazabitTransport } from "@/lib/pazabit/transports/pazabit-transport";

const eventMetadata = () => ({ eventId: crypto.randomUUID(), createdAt: Date.now() });

/** Presentation state only. Mesh delivery is delegated to a PazabitTransport implementation. */
export function usePazabit() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [groupList, setGroupList] = useState<Group[]>(seedGroups);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [composer, setComposer] = useState({ text: "", flag: null as Flag, tags: [] as string[] });
  const [tagging, setTagging] = useState<Message | null>(null);
  const [modalTags, setModalTags] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [connection, setConnection] = useState<MeshConnectionState>("connecting");
  const [passwordPrompt, setPasswordPrompt] = useState<{ groupId: string; groupTag: string } | null>(null);
  const transport = useRef<PazabitTransport | null>(null);

  const active = groupList.find((group) => group.id === activeGroup);
  const visibleMessages = useMemo(
    () => (active ? messages.filter((message) => message.groups.includes(active.tag)) : messages),
    [active, messages],
  );

  const flash = (title: string, detail: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, title, detail }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
  };

  const publish = (event: PazabitEvent) => transport.current?.publish(event);

  const fetchAudio = (messageId: string) =>
    transport.current?.fetchAudio(messageId) ?? Promise.resolve(null);

  const vote = (reportId: string, direction: "up" | "down") =>
    publish({ kind: "vote", reportId, direction, voterId: "anonymous-demo-node", ...eventMetadata() });

  const send = async (audio?: { blob: Blob; durationSec: number; mimeType: string }) => {
    if (!composer.text.trim() && !audio) return;
    const event: PazabitEvent = {
      kind: "report",
      body: composer.text.trim(),
      flag: composer.flag,
      groups: composer.tags,
      arrival: composer.tags.length ? "direct" : undefined,
      ...eventMetadata(),
    };
    if (audio) {
      const arrayBuffer = await audio.blob.arrayBuffer();
      event.audio = { data: arrayBuffer, durationSec: audio.durationSec, mimeType: audio.mimeType };
    }
    publish(event);
    setComposer({ text: "", flag: null, tags: [] });
  };

  const openTagging = (message: Message) => {
    setTagging(message);
    setModalTags([]);
  };

  const confirmTagging = () => {
    if (!tagging || !modalTags.length) return;
    publish({ kind: "escalation", reportId: tagging.id, groups: modalTags, ...eventMetadata() });
    setTagging(null);
  };

  const createGroup = (tag: string, password: string) => {
    const id = tag.slice(1).toLowerCase();
    publish({
      kind: "group-created",
      group: { id, tag, members: 1, status: "connected", description: "New private action group", hasPassword: true },
      password,
      ...eventMetadata(),
    });
    setCreatingGroup(false);
    setActiveGroup(id);
  };

  const requestGroupAccess = async (groupId: string | null) => {
    if (!groupId) {
      setActiveGroup(null);
      return;
    }
    const group = groupList.find((g) => g.id === groupId);
    if (!group) return;

    if (group.status === "locked" || group.hasPassword) {
      setPasswordPrompt({ groupId, groupTag: group.tag });
      return;
    }

    setActiveGroup(groupId);
  };

  const verifyGroupPassword = async (password: string) => {
    if (!passwordPrompt) return;
    const { groupId } = passwordPrompt;
    const ok = await transport.current?.verifyGroupPassword(groupId, password);
    if (ok) {
      setPasswordPrompt(null);
      setActiveGroup(groupId);
    } else {
      // Error will be shown in modal
      return false;
    }
    return true;
  };

  const cancelPasswordPrompt = () => {
    setPasswordPrompt(null);
  };

  useEffect(() => {
    const client = createSocketIoPazabitTransport();
    transport.current = client;
    return client.subscribe(
      (state) => {
        setMessages(state.messages);
        setGroupList(state.groups);
      },
      setConnection,
      (feedback) => flash(feedback.title, feedback.detail),
    );
  }, []);

  return {
    messages: visibleMessages,
    groupList,
    active,
    activeGroup,
    setActiveGroup: requestGroupAccess,
    composer,
    setComposer,
    vote,
    send,
    fetchAudio,
    tagging,
    modalTags,
    setModalTags,
    openTagging,
    closeTagging: () => setTagging(null),
    confirmTagging,
    creatingGroup,
    setCreatingGroup,
    createGroup,
    toasts,
    connected: connection === "connected",
    passwordPrompt,
    verifyGroupPassword,
    cancelPasswordPrompt,
  };
}