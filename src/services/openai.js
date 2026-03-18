// ─── Presentation metadata ─────────────────────────────────────────────────

const LANG_META = {
  Algérien: { color: "#10b981", flag: "🇩🇿" },
  Français:  { color: "#f97316", flag: "🇫🇷" },
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

// ─── Main export ───────────────────────────────────────────────────────────

export async function analyzeText(text) {
  const res = await fetch("/.netlify/functions/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error ?? `Erreur serveur (${res.status})`);
  }

  const parsed = await res.json();
  return enrichAnalysis(parsed, text);
}
