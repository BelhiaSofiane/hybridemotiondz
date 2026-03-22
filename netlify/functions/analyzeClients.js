import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  clientChunkResponseSchema,
  clientApiResponseSchema,
} from "../../schemas/clientBatchAnalysis.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CHUNK_SIZE = 18;

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function analyzeOneChunk(openai, items) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu analyses des avis clients e-commerce en Algérie (darija, français, arabe, mélange).
Pour CHAQUE objet { id, comment } fourni, renvoie UN sentiment parmi : positive, neutral, negative, mixed.
- positive : satisfaction claire
- negative : insatisfaction, plainte
- mixed : à la fois positif et négatif
- neutral : factuel, sans charge émotionnelle forte

Calcule aussi pour CE lot uniquement :
- estimatedFrPct : proportion estimée 0-100 de mots/expressions typiquement français vs darija+arabe dans les commentaires du lot
- estimatedIhl : indice d'hybridité linguistique 0-100 (100 = fort mélange franco-algérien dans les commentaires du lot)
- delayRelatedCountInChunk : nombre de commentaires du lot qui évoquent clairement retard / délai / taakhr / livraison lente
- themeHints : jusqu'à 6 courts thèmes ou hashtags (ex: "livraison", "service client")

Les ids en sortie doivent EXACTEMENT correspondre aux ids fournis, dans le même ordre que la liste d'entrée.`,
      },
      {
        role: "user",
        content: JSON.stringify({ comments: items }),
      },
    ],
    response_format: zodResponseFormat(clientChunkResponseSchema, "client_chunk"),
  });

  const message = response.choices[0].message;
  const parsed =
    message.parsed ??
    (() => {
      const raw = message.content ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      return clientChunkResponseSchema.parse(JSON.parse(clean));
    })();

  return clientChunkResponseSchema.parse(parsed);
}

function mergeChunks(chunks, normalizedRows) {
  const byId = new Map();
  for (const c of chunks) {
    for (const row of c.analyzed) {
      byId.set(Number(row.id), row.sentiment);
    }
  }

  const rowAnalyses = normalizedRows.map((r) => ({
    id: r.id,
    sentiment: byId.get(r.id) ?? "neutral",
  }));

  const n = chunks.length || 1;
  const ihl = Math.round(
    chunks.reduce((s, c) => s + c.estimatedIhl, 0) / n
  );
  const frenchPct = Math.round(
    chunks.reduce((s, c) => s + c.estimatedFrPct, 0) / n
  );
  const algerianPct = Math.max(0, Math.min(100, 100 - frenchPct));
  const delayMentions = chunks.reduce(
    (s, c) => s + c.delayRelatedCountInChunk,
    0
  );
  const themeSet = new Set();
  for (const c of chunks) {
    for (const t of c.themeHints ?? []) {
      if (t?.trim()) themeSet.add(t.trim());
    }
  }
  const themes = [...themeSet].slice(0, 12);

  const intensityLabel =
    ihl < 35
      ? "intensité faible"
      : ihl < 70
        ? "intensité moyenne"
        : "intensité forte";

  const insights = {
    delays:
      delayMentions > 0
        ? `${delayMentions} avis évoquent des délais ou retards de livraison.`
        : "Peu de mentions explicites de délais dans ce jeu de données.",
    service:
      "Synthèse automatique à partir des sentiments par avis (voir graphiques).",
    hybrid: `Indice d'hybridité linguistique estimé à ${ihl}% sur ce corpus (français ~${frenchPct}%, darija/arabe ~${algerianPct}%).`,
  };

  return clientApiResponseSchema.parse({
    rowAnalyses,
    ihl,
    frenchPct,
    algerianPct,
    themes,
    delayMentions,
    intensityLabel,
    insights,
  });
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body ?? "{}");
    const rows = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "rows[] requis et non vide" }),
      };
    }

    const normalized = rows.map((r, i) => ({
      id: Number(r.id) || i + 1,
      comment: String(r.comment ?? "").slice(0, 2000),
    }));

    const chunks = chunkArray(normalized, CHUNK_SIZE);
    const results = [];

    for (const part of chunks) {
      const items = part.map((r) => ({
        id: r.id,
        comment: r.comment,
      }));
      const parsed = await analyzeOneChunk(client, items);
      results.push(parsed);
    }

    const merged = mergeChunks(results, normalized);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    };
  } catch (err) {
    console.error("analyzeClients error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message ?? "Erreur serveur" }),
    };
  }
};
