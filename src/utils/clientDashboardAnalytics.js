// Stopwords (FR / AR / Darija) — excluded from word frequency
const STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "est", "en", "au", "aux", "à", "pour", "avec", "sur", "dans",
  "ce", "ces", "cette", "son", "sa", "ses", "mon", "ma", "mes", "ton", "ta", "tes", "notre", "votre", "leur",
  "il", "elle", "on", "nous", "vous", "ils", "elles", "je", "tu",
  "que", "qui", "quoi", "dont", "où", "mais", "ou", "donc", "car", "ni", "si",
  "kan", "f", "w", "3la", "b", "m3a", "d", "l", "fi", "daba",
]);

/** Extract top N words by frequency from comment text (handles Arabic, French, Darija). */
function computeTopWords(data, limit = 12) {
  const counts = new Map();
  for (const row of data) {
    const text = String(row.comment ?? "").normalize("NFC");
    // Split on whitespace + punctuation, keep words >= 2 chars
    const tokens = text.toLowerCase()
      .replace(/[\u0600-\u06FF]+/g, (ar) => ar + " ") // separate Arabic words
      .split(/[\s.,;:!?'"()\[\]{}–—\-/\\]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !/^\d+$/.test(t) && !STOPWORDS.has(t));
    for (const t of tokens) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Build dashboard aggregates from CSV rows + validated OpenAI batch response.
 */
export function computeDashboardAnalytics(data, api) {
  const sentimentMap = {};
  for (const r of api.rowAnalyses) {
    sentimentMap[r.id] = r.sentiment;
  }

  const total = data.length;
  let pos = 0;
  let neg = 0;
  let mixed = 0;
  let neutral = 0;

  for (const row of data) {
    const s = sentimentMap[row.id] ?? "neutral";
    if (s === "positive") pos++;
    else if (s === "negative") neg++;
    else if (s === "mixed") mixed++;
    else neutral++;
  }

  const cityMap = {};
  for (const r of data) {
    const city = r.city || "—";
    if (!cityMap[city]) {
      cityMap[city] = { pos: 0, neg: 0, neutral: 0, total: 0 };
    }
    cityMap[city].total++;
    const s = sentimentMap[r.id] ?? "neutral";
    if (s === "positive") cityMap[city].pos++;
    else if (s === "negative") cityMap[city].neg++;
    else cityMap[city].neutral++;
  }

  const shipMap = {};
  for (const r of data) {
    const t = r.shipment_type || "—";
    if (!shipMap[t]) {
      shipMap[t] = { pos: 0, neg: 0, neutral: 0, total: 0 };
    }
    shipMap[t].total++;
    const s = sentimentMap[r.id] ?? "neutral";
    if (s === "positive") shipMap[t].pos++;
    else if (s === "negative") shipMap[t].neg++;
    else shipMap[t].neutral++;
  }

  return {
    total,
    pos,
    neg,
    mixed,
    neutral,
    sentimentMap,
    cityMap,
    shipMap,
    topWords: computeTopWords(data),
    ihl: api.ihl,
    frenchPct: api.frenchPct,
    algerianPct: api.algerianPct,
    themes: api.themes,
    delayMentions: api.delayMentions,
    intensityLabel: api.intensityLabel,
    insights: api.insights,
    posRatio: total ? Math.round((pos / total) * 100) : 0,
    negRatio: total ? Math.round((neg / total) * 100) : 0,
    neutralRatio: total ? Math.round(((neutral + mixed) / total) * 100) : 0,
  };
}

/** Empty dashboard before any analysis */
export function emptyDashboardAnalytics() {
  return {
    total: 0,
    pos: 0,
    neg: 0,
    mixed: 0,
    neutral: 0,
    sentimentMap: {},
    cityMap: {},
    shipMap: {},
    topWords: [],
    ihl: 0,
    frenchPct: 50,
    algerianPct: 50,
    themes: [],
    delayMentions: 0,
    intensityLabel: "intensité moyenne",
    insights: {
      delays: "Lancez une analyse pour générer des insights.",
      service: "",
      hybrid: "",
    },
    posRatio: 0,
    negRatio: 0,
    neutralRatio: 0,
  };
}
