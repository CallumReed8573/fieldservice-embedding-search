import test from "node:test";
import assert from "node:assert/strict";
import { decideDispatch, type SearchHit } from "./dispatch_decision.ts";
test("follow-up text takes priority over a fresh dispatch", () => {
  const hit: SearchHit = { id: "WO-1042", photoNotes: "hinge is cracked", dispatchStatus: "scheduled", technicianFollowUp: "confirm replacement part", score: 0.91 };
  assert.equal(decideDispatch(hit), "follow up with technician for WO-1042");
});
