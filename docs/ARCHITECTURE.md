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
 ├─ Web: SocketIoPazabitTransport → simulated relay
 └─ Android: BitchatTransport → PAZABIT_EVENT (0x50) over BLE / Wi-Fi Aware
```

| Event | Web demo | Android |
| --- | --- | --- |
| `report` | `PazabitEvent` via Socket.IO | `SafetyEvent.Report` encoded in `PAZABIT_EVENT` |
| `vote` | `PazabitEvent` via Socket.IO | `SafetyEvent.Vote` |
| `escalation` | `PazabitEvent` via Socket.IO | `SafetyEvent.Escalation` |
| `group-created` | `PazabitEvent` via Socket.IO | `SafetyEvent.GroupCreated` |

Socket.IO exists only to demonstrate mesh-like broadcast and eventual state sync in a browser.
