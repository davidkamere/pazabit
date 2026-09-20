# Pazabit

Safety reporting prototype with a Socket.IO relay that simulates Bluetooth mesh synchronization.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in two browser windows to see votes, messages, private-group creation, and report escalations synchronize live.

## Features

- **Mesh-style messaging** — In-memory Socket.IO relay simulates Bluetooth mesh broadcast
- **Voice messages** — Record/play audio via MediaRecorder API
- **Message scoring** — Net score (upvotes − downvotes) ordering; positive scores first
- **Group feeds** — Switch between `#mesh` (all) and action groups
- **Urgent tagging** — Mark reports `urgent`/`ongoing`; urgent reports require group targets
- **Escalation (tagging)** — Community-verified reports can be routed to additional groups
- **Private groups** — Create password-protected groups; join requires password
- **Search** — Filter groups in feed header, tag modal, and composer

## Architecture

```
Web UI (React)
      │
      ▼ creates PazabitEvent
Pazabit Domain (reducer, types)
      │
      ▼ delegates transport
PazabitTransport (interface)
      │
      ├─ Web: SocketIoPazabitTransport → simulated relay (Socket.IO)
      └─ Android (future): BitchatTransport → PAZABIT_EVENT (0x50) over BLE / Wi-Fi Aware
```

### Domain Events

| Event | Payload | Transport |
|-------|---------|-----------|
| `report` | body, flag, groups, arrival, audio | Socket.IO |
| `vote` | reportId, direction, voterId | Socket.IO |
| `escalation` | reportId, groups | Socket.IO |
| `group-created` | group, password | Socket.IO |

### Key Modules

| Path | Responsibility |
|------|----------------|
| `domain/pazabit-events.ts` | Transport-neutral event types |
| `types/index.ts` | Core domain types (`Group`, `Message`, `Flag`) |
| `lib/pazabit/reducer.ts` | Deterministic state transitions |
| `lib/pazabit/transports/` | Transport contract + Socket.IO adapter |
| `lib/pazabit/group-auth.ts` | Password store (server-side) |
| `server.ts` | In-memory relay (Socket.IO) |
| `hooks/usePazabit.ts` | Presentation state & actions |
| `components/` | Focused UI components by feature |

### Data Flow

1. UI dispatches domain event via `usePazabit` → `transport.publish(event)`
2. Socket.IO relay receives event, applies reducer, broadcasts new state
3. All clients receive `pazabit:state` → update local state via `subscribe` callback

### Styling

- Tailwind CSS v4 with custom theme (`app/globals.css`)
- Monospace font, dark theme, lime accent
- No Next.js dev indicator (`devIndicators: false`)

## Development

```bash
npm run dev     # Start dev server (tsx watch + Next.js)
npm run build   # Production build
npm run lint    # ESLint
npm run start   # Production server
```

## Notes

- Relay is in-memory — no durability (demo only)
- Passwords stored in server memory (demo only)
- Anonymous node identities (`voterId: "anonymous-demo-node"`)
- Android implementation would replace `SocketIoPazabitTransport` with `BitchatTransport`