/**
 * Shared Zod schemas for batch client analysis (CSV / démo).
 * Used by: browser (validate API JSON) and netlify/functions/analyzeClients.js
 */
import { z } from "zod";

export const clientSentimentEnum = z.enum([
  "positive",
  "neutral",
  "negative",
  "mixed",
]);

export const rowAnalysisSchema = z.object({
  id: z.coerce.number(),
  sentiment: clientSentimentEnum,
});

/** One OpenAI chunk response (internal; merged server-side) */
export const clientChunkResponseSchema = z.object({
  analyzed: z.array(rowAnalysisSchema),
  estimatedFrPct: z.number().int().min(0).max(100),
  estimatedIhl: z.number().int().min(0).max(100),
  delayRelatedCountInChunk: z.number().int().min(0),
  themeHints: z.array(z.string()).max(6).optional().default([]),
});

/** Final payload returned to the browser */
export const clientApiResponseSchema = z.object({
  rowAnalyses: z.array(rowAnalysisSchema),
  ihl: z.number().int().min(0).max(100),
  frenchPct: z.number().int().min(0).max(100),
  algerianPct: z.number().int().min(0).max(100),
  themes: z.array(z.string()).max(12),
  delayMentions: z.number().int().min(0),
  intensityLabel: z.enum([
    "intensité faible",
    "intensité moyenne",
    "intensité forte",
  ]),
  insights: z.object({
    delays: z.string(),
    service: z.string(),
    hybrid: z.string(),
  }),
});
