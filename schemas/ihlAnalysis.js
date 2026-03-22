/**
 * Zod schema for single-message IHL analysis (AnalyzeForm / analyze function).
 */
import { z } from "zod";

export const ihlTokenSchema = z.object({
  word: z.string(),
  lang: z.enum(["ar", "fr"]),
  highlight: z.boolean(),
});

export const ihlAnalysisSchema = z.object({
  sentiment: z.object({
    label: z.enum(["positif", "négatif", "neutre"]),
    score: z.number().int().min(0).max(100),
  }),
  dominante: z.enum(["dominante arabe", "dominante française"]),
  intensite: z.enum([
    "intensité faible",
    "intensité moyenne",
    "intensité forte",
  ]),
  emotionScore: z.number().int().min(0).max(100),
  tokens: z.array(ihlTokenSchema).min(1),
});
