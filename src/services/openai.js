import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

// ─── Zod Schema ──────────────────────────────────────────────────────────────
// Colors + flags are presentation-only, so they're kept out of the AI schema
// and re-attached in enrichAnalysis() below.

const TokenSchema = z.object({
  word: z.string(),
  lang: z.enum(["ar", "fr"]),
  highlight: z.boolean(),
});

const AnalysisSchema = z.object({
  sentiment: z.object({
    label: z.enum(["positif", "négatif", "neutre"]),
    score: z.number().int().min(0).max(100),
  }),
  dominante: z.enum(["dominante arabe", "dominante française"]),
  intensite: z.enum(["intensité faible", "intensité moyenne", "intensité forte"]),
  emotionScore: z.number().int().min(0).max(100),
  tokens: z.array(TokenSchema).min(1),
});

// ─── Presentation metadata ────────────────────────────────────────────────────

const LANG_META = {
  Algérien: { color: "#10b981", flag: "🇩🇿" },
  Français:  { color: "#f97316", flag: "🇫🇷" },
};

function computeLangDistribution(tokens) {
  const total = tokens.length || 1;
  const arCount = tokens.filter((t) => t.lang === "ar").length;
  const frCount = total - arCount;

  const algPct = Math.round((arCount / total) * 100);
  const frPct = 100 - algPct;

  // IHL: 0 mono-langue, 100 parfaitement hybride (50/50)
  const ihl = 100 - Math.abs(algPct - 50) * 2;

  const langues = [
    { name: "Algérien", pct: algPct },
    { name: "Français", pct: frPct },
  ];

  return { ihl, langues };
}

function enrichAnalysis(parsed, inputText) {
  const { ihl, langues } = computeLangDistribution(parsed.tokens);

  return {
    ...parsed,
    inputText,
    ihl,
    langues: langues.map((l) => ({
      ...l,
      ...(LANG_META[l.name] ?? { color: "#6b7280", flag: "🌐" }),
    })),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function analyzeText(text) {
  // Simple deterministic tokenisation: every "word" separated by whitespace
  const rawTokens = text
  .toLowerCase()
  .replace(/[.,!?;:()"'«»…\-]/g, "")
  .split(/\s+/)
  .map((w) => w.trim())
  .filter((w) => w.length > 0);

  const tokensForPrompt = rawTokens.map((word) => ({ word }));

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es un analyseur expert UNIQUEMENT des textes hybrides franco-algériens (Darija + Français).
Si le texte n'est pas un mélange franco-algérien, tu adaptes au mieux mais l'analyse reste centrée sur ce dialecte.

ÉTAPE 1 — On te fournit déjà la liste de tokens, NE LA MODIFIE PAS.
Pour chaque token reçu, assigne :
  - lang: "ar"  → mot algérien / darija / arabe (ex: wah, khti, ndirou, wesh, rak, barak, yallah…)
  - lang: "fr"  → mot français ou particule neutre (ex: ce, soir, directement, et, la, plage…)
  - highlight: true pour tous les tokens

ÉTAPE 2 — À partir de ces tokens, remplis UNIQUEMENT :
- sentiment    : { label: "positif"|"négatif"|"neutre", score: 0-100 }
- dominante    : "dominante arabe"|"dominante française"
- intensite    : "intensité faible"|"intensité moyenne"|"intensité forte"
- emotionScore : score émotionnel global 0-100
- tokens       : la même liste qu'en entrée avec pour chaque élément : { word, lang, highlight }

NE CALCULE PAS les pourcentages ni l'IHL : ils seront calculés côté application à partir des tokens annotés.`,
      },
      {
        role: "user",
        content: JSON.stringify({ tokens: tokensForPrompt }),
      },
    ],
    response_format: zodResponseFormat(AnalysisSchema, "analysis"),
  });

  const message = response.choices[0].message;

  // zodResponseFormat populates .parsed, but falls back to null on some
  // model versions — in that case manually parse the raw JSON content.
  const parsed =
    message.parsed ??
    (() => {
      const raw = message.content ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      return AnalysisSchema.parse(JSON.parse(clean));
    })();

  if (!parsed) throw new Error("Réponse vide ou non parseable de l'API.");

  return enrichAnalysis(parsed, text);
}