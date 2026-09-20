# Pazabit
<img width="331" height="715" alt="Screenshot 2026-09-20 at 18 36 15" src="https://github.com/user-attachments/assets/02ae9981-b7d3-4855-a17f-6ff9f4b12ca4" />
<img width="332" height="720" alt="Screenshot 2026-09-20 at 18 37 23" src="https://github.com/user-attachments/assets/3e549258-db10-40df-97ce-d98674d7cb94" />

<img width="331" height="718" alt="Screenshot 2026-09-20 at 18 37 53" src="https://github.com/user-attachments/assets/8125ec59-7ef3-42cb-8444-1d12f8916e81" />



Safety reporting prototype with a Socket.IO relay that simulates Bluetooth mesh synchronization.

## Mobile Version

The **Kotlin/Android implementation** is available at: **https://github.com/davidkamere/pazabitmobile**

Built on the [bitchat Android](https://github.com/permissionlesstech/bitchat-android) mesh architecture, it uses Bluetooth LE + Wi-Fi Aware for true offline peer-to-peer mesh networking. Current status: **early-stage variant** — core mesh transport works; threat-report data model, submission UI, and mesh propagation are functional.

| Feature | Web Demo (This Repo) | Mobile (pazabitmobile) |
|---------|---------------------|------------------------|
| Transport | Socket.IO (simulated relay) | BLE + Wi-Fi Aware (real mesh) |
| Persistence | In-memory | In-memory (StateFlow) |
| Encryption | None | Noise XX (X25519 + ChaCha20-Poly1305) |
| Multi-hop | N/A | Up to 7 hops |
| Offline capable | No | Yes |

## Mobile Progress Summary 

### ✅ Implemented
- **Structured Threat Reports** — `SafetyEvent.Report` with body, severity (NONE/ONGOING/URGENT), private group targeting
- **Voting** — Up/down votes on reports (`SafetyEvent.Vote`) with real-time tallies
- **Escalation** — Urgent/highly-upvoted reports can be escalated to community groups (`SafetyEvent.Escalation`)
- **Private Groups** — Create named groups (`#tag`) for targeted delivery (`SafetyEvent.GroupCreated`)
- **Mesh Propagation** — Events encoded via binary codec (`PazabitEventCodec` v1) over bitchat mesh (BLE + Wi-Fi Aware, Noise XX encryption)
- **Store-and-Forward** — In-memory merge + re-broadcast via mesh relay logic
- **Compose UI** (`PazabitScreen`) — Composer with flag selector, group picker, live feed, vote rows, escalation, group drawer
- **No Accounts/Servers** — Identity from ephemeral Noise static keys; fully decentralized

### 🚧 Not Yet Implemented
- Persistence across app restarts
- Media attachments (photo/audio) in reports
- Geohash location embedding
- Collector-node aggregation + internet sync when connectivity returns
- Background duty-cycling optimizations
- Nostr/geohash channel fallback

### Architecture
```
UI (Compose/MVVM)
    │ creates SafetyEvent
    ▼
SafetyRepository (StateFlow)
    │
    ▼ encodes via PazabitEventCodec
MeshService.sendPazabitEvent()
    │
    ├─ Bluetooth LE Mesh (multi-hop, up to 7)
    └─ Wi-Fi Aware (higher bandwidth)
        │
        ▼ Noise XX encryption (X25519 + ChaCha20-Poly1305)
    Peer devices
```

---

## Run locally (Web Demo)

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in two browser windows to see votes, messages, private-group creation, and report escalations synchronize live.

## Web Demo Architecture

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

## Development (Web)

```bash
npm run dev     # Start dev server (tsx watch + Next.js)
npm run build   # Production build
npm run lint    # ESLint
npm run start   # Production server
```

## Notes

- Web relay is in-memory — no durability (demo only)
- Passwords stored in server memory (demo only)
- Anonymous node identities (`voterId: "anonymous-demo-node"`)
- Android implementation would replace `SocketIoPazabitTransport` with `BitchatTransport`
