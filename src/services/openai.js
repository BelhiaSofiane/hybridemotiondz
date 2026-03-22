// ─── IHL single-text analysis (AnalyzeForm) — distinct from clientsAnalyze.js ─

import { ihlAnalysisSchema } from "../../schemas/ihlAnalysis.js";

const LANG_META = {
  Algérien: { color: "#10b981", flag: "🇩🇿" },
  Français: { color: "#f97316", flag: "🇫🇷" },
};

function computeLangDistribution(tokens) {
  const total = tokens.length || 1;
  const arCount = tokens.filter((t) => t.lang === "ar").length;
  const algPct = Math.round((arCount / total) * 100);
  const frPct = 100 - algPct;
  const ihl = 100 - Math.abs(algPct - 50) * 2;

  return {
    ihl,
    langues: [
      { name: "Algérien", pct: algPct },
      { name: "Français", pct: frPct },
    ],
  };
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

/**
 * Analyse IHL d’un seul texte (route /analyze, AnalyzeForm).
 * Réponse validée avec Zod côté client après l’appel Netlify `analyze`.
 */
export async function analyzeIhlText(text) {
  const res = await fetch("/.netlify/functions/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(raw.error ?? `Erreur serveur (${res.status})`);
  }

  const parsed = ihlAnalysisSchema.parse(raw);
  return enrichAnalysis(parsed, text);
}

/** @deprecated alias — préférez analyzeIhlText */
export const analyzeText = analyzeIhlText;
