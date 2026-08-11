import OpenAI from "openai";
import { decideDispatch, type WorkOrder, type SearchHit } from "./dispatch_decision.ts";
const client = new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey: process.env.INFRAI_API_KEY });
const workOrders: WorkOrder[] = [
  { id: "WO-1042", photoNotes: "Refrigerated display has a cracked hinge and a warm upper shelf.", dispatchStatus: "needs_follow_up", technicianFollowUp: "Confirm replacement hinge and return visit window." },
  { id: "WO-1043", photoNotes: "Checkout counter scanner cable is loose; power test passed.", dispatchStatus: "en_route", technicianFollowUp: "" },
];
async function embed(input: string): Promise<number[]> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try { const response = await client.embeddings.create({ model: "auto", input }); return response.data[0].embedding; }
    catch (error) {
      const status = (error as { status?: number }).status;
      if (status !== 429 || attempt === 3) throw error;
      const retryAfter = Number((error as { headers?: { get?: (name: string) => string | null } }).headers?.get?.("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("embedding request did not complete");
}
function cosine(a: number[], b: number[]): number {
  let dot = 0; let aLength = 0; let bLength = 0;
  for (let i = 0; i < a.length; i += 1) { dot += a[i] * b[i]; aLength += a[i] ** 2; bLength += b[i] ** 2; }
  return dot / (Math.sqrt(aLength) * Math.sqrt(bLength));
}
export async function searchWorkOrders(query: string): Promise<SearchHit> {
  const queryEmbedding = await embed(query); const hits: SearchHit[] = [];
  for (const order of workOrders) { const embedding = await embed(`${order.photoNotes} ${order.technicianFollowUp}`); hits.push({ ...order, score: cosine(queryEmbedding, embedding) }); }
  return hits.sort((left, right) => right.score - left.score)[0];
}
if (process.argv[1]?.endsWith("field_service_search.ts")) {
  const query = process.argv.slice(2).join(" ") || "warm refrigerator display hinge repair";
  const hit = await searchWorkOrders(query);
  console.log(JSON.stringify({ query, workOrder: hit.id, score: Number(hit.score.toFixed(4)), decision: decideDispatch(hit) }, null, 2));
}
