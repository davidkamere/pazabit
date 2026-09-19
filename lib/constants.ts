import { Group, Message } from "@/types";

export const ESCALATION_THRESHOLD = 5;
export const groups: Group[] = [
  { id: "medical", tag: "#Medical", members: 18, status: "connected", description: "First aid, transport & supplies", hasPassword: false },
  { id: "security", tag: "#Security", members: 32, status: "connected", description: "Protection & safe passage", hasPassword: false },
  { id: "legal", tag: "#LegalAid", members: 9, status: "locked", description: "Rights & legal support", hasPassword: true },
  { id: "bridge", tag: "#RedCrossBridge", members: 14, status: "connected", description: "Humanitarian coordination", hasPassword: false },
];

export const initialMessages: Message[] = [
  { id: "m1", time: "2m", body: "Road blocked near the east market. Two vehicles involved — traffic is backing up fast.", flag: "ongoing", upvotes: 7, downvotes: 0, groups: ["#Security"], arrival: "community" },
  { id: "m2", time: "6m", body: "Need a medic at Kibera Gate 3. Adult with a deep cut, conscious but bleeding heavily.", flag: "urgent", upvotes: 12, downvotes: 1, groups: ["#Medical", "#Security"], arrival: "direct" },
  { id: "m3", time: "11m", body: "Power has been out around South B since 4:20pm. Sharing in case anyone has a safe charging point.", flag: null, upvotes: 4, downvotes: 0, groups: [] },
  { id: "m4", time: "18m", body: "Voice update from the bridge entrance.", flag: "ongoing", upvotes: 3, downvotes: 0, groups: [], voiceSeconds: 18 },
];
