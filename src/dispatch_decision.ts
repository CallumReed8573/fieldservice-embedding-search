export type DispatchStatus = "scheduled" | "en_route" | "needs_follow_up";
export type WorkOrder = { id: string; photoNotes: string; dispatchStatus: DispatchStatus; technicianFollowUp: string };
export type SearchHit = WorkOrder & { score: number };
export function decideDispatch(hit: SearchHit): string {
  if (hit.dispatchStatus === "needs_follow_up" || hit.technicianFollowUp.trim().length > 0) return `follow up with technician for ${hit.id}`;
  if (hit.dispatchStatus === "en_route") return `keep dispatch active for ${hit.id}`;
  return `schedule ${hit.id}`;
}
