import { Group, Message } from "@/types";

export const ESCALATION_THRESHOLD = 5;
export const groups: Group[] = [
  { id: "msf-kenya", tag: "#MSF-Kenya-0722111178", members: 45, status: "locked", description: "Médecins Sans Frontières Kenya — Emergency medical care", hasPassword: true },
  { id: "kma", tag: "#KMA-0722222222", members: 120, status: "locked", description: "Kenya Medical Association — Doctor network & referrals", hasPassword: true },
  { id: "medics-for-kenya", tag: "#MedicsForKenya-0711333444", members: 85, status: "locked", description: "Medics for Kenya — Volunteer medic network for protests", hasPassword: true },
  { id: "protesters-medical-brigade", tag: "#ProtestersMedicalBrigade-0733555666", members: 60, status: "locked", description: "Protesters' Medical Brigade — Frontline protest medic response", hasPassword: true },
  { id: "emkf", tag: "#EMKF-0700777888", members: 40, status: "locked", description: "Emergency Medicine Kenya Foundation — Training & coordination", hasPassword: true },
  { id: "redcross-kenya", tag: "#RedCross-0722111178", members: 200, status: "locked", description: "Kenya Red Cross Society — Ambulance, first aid & disaster response", hasPassword: true },
];

export const initialMessages: Message[] = [
  { id: "m1", time: "2m", body: "Road blocked near the east market. Two vehicles involved — traffic is backing up fast.", flag: "ongoing", upvotes: 7, downvotes: 0, groups: ["#RedCross-0722111178"], arrival: "community" },
  { id: "m2", time: "6m", body: "Need a medic at Kibera Gate 3. Adult with a deep cut, conscious but bleeding heavily.", flag: "urgent", upvotes: 12, downvotes: 1, groups: ["#MedicsForKenya-0711333444", "#ProtestersMedicalBrigade-0733555666"], arrival: "direct" },
  { id: "m3", time: "11m", body: "Power has been out around South B since 4:20pm. Sharing in case anyone has a safe charging point.", flag: null, upvotes: 4, downvotes: 0, groups: [] },
  { id: "m4", time: "18m", body: "Voice update from the bridge entrance.", flag: "ongoing", upvotes: 3, downvotes: 0, groups: [], voiceSeconds: 18 },
];