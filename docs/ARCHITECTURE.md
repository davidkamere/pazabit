# Pazabit demo ↔ mobile architecture

The web demo intentionally models the Android app's boundaries. Its Socket.IO server is only a transport simulator, never a UI dependency.

```text
Web UI / Compose UI
        │ creates a Pazabit event
        ▼
Pazabit domain reducer / repository
        │ delegates transport
        ▼
PazabitTransport
 ├─ Web: SocketIoPazabitTransport → simulated relay (Socket.IO)
 └─ Android: BitchatTransport → PAZABIT_EVENT (0x50) over BLE / Wi-Fi Aware
```

## Event mapping

| Event | Web demo | Android |
| --- | --- | --- |
| `report` | `PazabitEvent` via Socket.IO | `SafetyEvent.Report` encoded in `PAZABIT_EVENT` |
| `vote` | `PazabitEvent` via Socket.IO | `SafetyEvent.Vote` |
| `escalation` | `PazabitEvent` via Socket.IO | `SafetyEvent.Escalation` |
| `group-created` | `PazabitEvent` via Socket.IO | `SafetyEvent.GroupCreated` |

Socket.IO exists only to demonstrate mesh-like broadcast and eventual state sync in a browser. It is **not** part of the safety-reporting domain.

## Transport contract

The `PazabitTransport` interface defines the boundary between UI and transport:

```typescript
type PazabitTransport = {
  publish(event: PazabitEvent): void;
  subscribe(
    onState: (state: PazabitMeshState) => void,
    onConnection: (state: MeshConnectionState) => void,
    onFeedback: (message: { title: string; detail: string }) => void,
  ): () => void;
  // Optional capabilities (web demo only):
  fetchAudio(messageId: string): Promise<AudioAttachment | null>;
  verifyGroupPassword(groupId: string, password: string): Promise<boolean>;
};
```

**Current note**: The interface includes optional web-only capabilities (`fetchAudio`, `verifyGroupPassword`). A future cleanup should separate these into capability interfaces so the core contract stays transport-neutral.

## Server (simulated relay)

`server.ts` — In-memory Socket.IO relay that:

- Holds `meshState: { messages, groups }`
- Applies `applyPazabitEvent` reducer on each event
- Broadcasts `pazabit:state` to all connected clients
- Stores audio blobs in `audioStore: Map<eventId, AudioAttachment>`
- Stores group passwords in `groupPasswords: Map<groupId, password>`
- Handles `pazabit:group:verify` and `pazabit:audio:request`

## Hook: `usePazabit`

Single presentation-state hook (`hooks/usePazabit.ts`) that:

- Owns all UI state: `messages`, `groupList`, `activeGroup`, `composer`, `toasts`, `connection`, `passwordPrompt`
- Memoizes `visibleMessages` (filtered by active group, sorted by net score)
- Memoizes `topGroups` (top 5 by message count, fallback to first 5)
- Delegates all transport to `DemoPazabitTransport` via `PazabitTransport` ref
- Exposes actions: `vote`, `send`, `createGroup`, `requestGroupAccess`, `verifyGroupPassword`, `fetchAudio`, `openTagging`, `confirmTagging`

## Components

| Component | Responsibility |
|-----------|----------------|
| `FeedHeader` | Group switcher with search, create group button |
| `Composer` | Text input, voice recording, urgent flag, group search + toggles |
| `MessageCard` | Message display, voice playback, voting, tagging |
| `TagModal` | Escalation group picker with search |
| `CreateGroupModal` | Group creation (hashtag + password) |
| `GroupPasswordModal` | Password entry for locked groups |

## Data structures

```
PazabitMeshState = {
  messages: Message[],
  groups: Group[]
}

Message = {
  id, time, body, flag, upvotes, downvotes, groups[], arrival?, voiceSeconds?, voted?
}

Group = {
  id, tag, members, status: "connected" | "locked", description, hasPassword
}
```

## Message ordering

1. Positive net score (upvotes − downvotes > 0) — descending score, then newest first
2. Zero/negative score — newest first (array order)

## Empty states

- No group selected + no messages → nothing (composer only)
- No group selected + messages → "mesh reports" header + all messages
- Group selected + no messages → "No messages in {tag} yet"
- Group selected + messages → "mesh reports" header + filtered messages