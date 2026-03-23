/**
 * IHL (Indice d'Hybridité Linguistique) PDF — built with jsPDF, same approach as clientsReportPdf.
 */
import { jsPDF } from "jspdf";

function safeIhlFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `rapport-ihl_${date}.pdf`;
}

function truncate(s, max) {
  if (s == null) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Draw a simple donut-style bar for IHL / language distribution */
function drawDonutBar(doc, x, y, w, h, pct, colorRgb) {
  const [r, g, b] = colorRgb;
  const filled = (pct / 100) * w;
  doc.setFillColor(r, g, b);
  doc.rect(x, y, filled, h, "F");
  doc.setFillColor(230, 230, 230);
  doc.rect(x + filled, y, w - filled, h, "F");
}

/**
 * @param {object} params
 * @param {object} params.analysisData — IHL analysis result (ihl, langues, sentiment, etc.)
 * @param {string} params.text — original input text (optional, fallback to inputText)
 */
export function downloadIhlAnalysisPdf({ analysisData, text }) {
  const d = analysisData;
  const inputText = text ?? d.inputText ?? "";
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - 2 * margin;
  let y = 16;

  const addPageIfNeeded = (needMm) => {
    if (y + needMm > pageH - 14) {
      doc.addPage();
      y = 16;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text("Rapport d'analyse IHL", margin, y);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const metaLines = [
    `Genere le : ${new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`,
    `Texte analyse : ${inputText.length} caracteres`,
  ];
  for (const line of metaLines) {
    doc.text(line, margin, y);
    y += 4.5;
  }
  y += 6;

  /* Indice IHL */
  const ihlLevel =
    d.ihl < 25 ? "hybridite faible" : d.ihl < 60 ? "hybridite moderee" : "hybridite elevee";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Indice d'Hybridite Linguistique (IHL)", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Score IHL : ${d.ihl}%`, margin, y);
  y += 5;
  doc.text(`Niveau : ${ihlLevel}`, margin, y);
  y += 5;
  doc.text("0% = monolingue  |  50% = tres hybride  |  100% = code-switching extreme", margin, y);
  y += 8;

  const barW = contentW * 0.6;
  const barH = 4;
  drawDonutBar(doc, margin, y, barW, barH, d.ihl, [16, 185, 129]);
  y += barH + 6;

  /* Repartition langues */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Repartition des langues", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const alg = d.langues?.[0] ?? { name: "Algerien", pct: 50 };
  const fr = d.langues?.[1] ?? { name: "Francais", pct: 50 };
  doc.text(`Algerien (Darija/Arabe) : ${alg.pct}%`, margin, y);
  y += 5;
  doc.text(`Francais : ${fr.pct}%`, margin, y);
  y += 5;
  drawDonutBar(doc, margin, y, barW, barH - 1, alg.pct, [16, 185, 129]);
  y += barH + 2;
  drawDonutBar(doc, margin, y, barW, barH - 1, fr.pct, [249, 115, 22]);
  y += barH + 8;

  /* Sentiment & emotion */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Sentiment et emotion", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const kpiLines = [
    `Sentiment : ${d.sentiment?.label ?? "—"} (${d.sentiment?.score ?? 0}%)`,
    `Dominante : ${d.dominante ?? "—"}`,
    `Intensite : ${d.intensite ?? "—"}`,
    `Score emotion : ${d.emotionScore ?? 0}%`,
  ];
  for (const line of kpiLines) {
    doc.text(line, margin, y);
    y += 5;
  }
  y += 6;

  /* Texte analyse (heatmap simplifiee) */
  if (inputText) {
    addPageIfNeeded(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Texte analyse", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const paras = doc.splitTextToSize(truncate(inputText, 800), contentW);
    for (const ln of paras) {
      addPageIfNeeded(5);
      doc.text(ln, margin, y);
      y += 4.5;
    }
    y += 6;
  }

  /* Liste des tokens (optionnel, pour voir la repartition) */
  if (d.tokens?.length) {
    addPageIfNeeded(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Mots par langue (echantillon)", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const sample = d.tokens.slice(0, 80);
    const arWords = sample.filter((t) => t.lang === "ar").map((t) => t.word);
    const frWords = sample.filter((t) => t.lang === "fr").map((t) => t.word);
    doc.setTextColor(16, 185, 129);
    doc.text(`Algerien : ${arWords.slice(0, 25).join(" ")}`, margin, y);
    y += 5;
    doc.setTextColor(249, 115, 22);
    doc.text(`Francais : ${frWords.slice(0, 25).join(" ")}`, margin, y);
    y += 8;
  }

  doc.save(safeIhlFilename());
}
