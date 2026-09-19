# Pazabit

Safety reporting prototype with a Socket.IO relay that simulates Bluetooth mesh synchronization.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in two browser windows to see votes, messages, private-group creation, and report escalations synchronize live.

## Architecture

The web demo models the native app as an event-driven mesh client. The UI publishes domain events, not Socket.IO commands, so its behavior maps cleanly to Bitchat packets on Android.

- `domain/pazabit-events.ts` — transport-neutral report, vote, escalation, and group events
- `lib/pazabit/reducer.ts` — deterministic mesh-state transition rules
- `lib/pazabit/transports/` — transport contract plus the Socket.IO demo adapter
- `server.ts` — in-memory relay that broadcasts the same events/state a mesh would converge on
- `hooks/usePazabit.ts` — presentation state; it depends only on `PazabitTransport`
- `components/` — focused presentation components by feature

See [the web-to-Android architecture map](docs/ARCHITECTURE.md) for the one-to-one Bitchat implementation path. Socket.IO is deliberately confined to one demo adapter; it is not part of the safety-reporting domain.

The relay intentionally keeps data in memory for the invention-sprint demo. A production system should add durable storage where appropriate, encrypted group membership, replay protection, abuse controls, and authorization checks while preserving anonymous node identities.
