/**
 * Batch client analysis (CSV / démo) — distinct from IHL single-text flow in openai.js.
 */
import { clientApiResponseSchema } from "../../schemas/clientBatchAnalysis.js";

/**
 * @param {Array<{ id: number, comment: string }>} rows
 */
export async function analyzeClientsDataset(rows) {
  const res = await fetch("/.netlify/functions/analyzeClients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rows: rows.map((r) => ({
        id: r.id,
        comment: String(r.comment ?? ""),
      })),
    }),
  });

  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(raw.error ?? `Erreur serveur (${res.status})`);
  }

  return clientApiResponseSchema.parse(raw);
}
