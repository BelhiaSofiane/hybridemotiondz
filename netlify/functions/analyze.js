import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ihlAnalysisSchema } from "../../schemas/ihlAnalysis.js";

// ✅ process.env — never exposed to the browser
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body ?? "{}");
    const { text } = body;
    if (typeof text !== "string" || !text.trim()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Champ text requis (non vide)" }),
      };
    }

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
      response_format: zodResponseFormat(ihlAnalysisSchema, "analysis"),
    });

    const message = response.choices[0].message;
    const parsed =
      message.parsed ??
      (() => {
        const raw = message.content ?? "";
        const clean = raw.replace(/```json|```/g, "").trim();
        return ihlAnalysisSchema.parse(JSON.parse(clean));
      })();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};