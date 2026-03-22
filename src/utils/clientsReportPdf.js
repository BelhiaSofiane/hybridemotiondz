/**
 * Client analysis PDF — built with jsPDF + jspdf-autotable (no html2canvas).
 * Reliable across Chromium / Firefox / WebKit; Arabic/darija in comments may
 * need a custom font later (Helvetica = Latin-focused).
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function safePdfFilename(fileLabel) {
  const stem =
    fileLabel && fileLabel !== "—"
      ? fileLabel.replace(/\.csv$/i, "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
      : "rapport-clients";
  const date = new Date().toISOString().slice(0, 10);
  return `${(stem || "rapport-clients").slice(0, 120)}_${date}.pdf`;
}

function truncateCell(s, max) {
  if (s == null) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Horizontal stacked bar: positive (green) | neutral (gray) | negative (red) */
function drawStackedBar(doc, x, y, w, h, posPct, neuPct, negPct) {
  const p = Math.max(0, posPct);
  const n = Math.max(0, neuPct);
  const g = Math.max(0, negPct);
  const sum = p + n + g || 1;
  let wp = (p / sum) * w;
  let wn = (n / sum) * w;
  let wg = (g / sum) * w;
  const rest = w - wp - wn - wg;
  wg += rest; // absorb float remainder

  let px = x;
  doc.setFillColor(34, 197, 94);
  doc.rect(px, y, wp, h, "F");
  px += wp;
  doc.setFillColor(148, 163, 184);
  doc.rect(px, y, wn, h, "F");
  px += wn;
  doc.setFillColor(239, 68, 68);
  doc.rect(px, y, wg, h, "F");
}

/**
 * @param {object} params
 * @param {string} params.fileName
 * @param {Array} params.data — client rows
 * @param {object} params.analytics — from computeDashboardAnalytics
 */
export function downloadClientsAnalysisPdf({ fileName, data, analytics }) {
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
  doc.text("Rapport d'analyse clients", margin, y);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const metaLines = [
    `Fichier : ${fileName && fileName !== "—" ? fileName : "—"}`,
    `Genere le : ${new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`,
    `${data.length} avis analyses`,
  ];
  for (const line of metaLines) {
    doc.text(line, margin, y);
    y += 4.5;
  }
  y += 5;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Indicateurs cles", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const kpiLines = [
    `Analyses : ${analytics.total}`,
    `Sentiment positif : ${analytics.posRatio}% (${analytics.pos} avis)`,
    `Sentiment negatif : ${analytics.negRatio}% (${analytics.neg} avis)`,
    `Neutre / mixte : ${analytics.neutralRatio}% (${analytics.neutral + analytics.mixed} avis)`,
    `Score IHL (hybridite linguistique) : ${analytics.ihl}%`,
    `Francais estime : ${analytics.frenchPct}%  |  Algerien (darija/arabe) estime : ${analytics.algerianPct}%`,
    `Intensite : ${analytics.intensityLabel}`,
  ];
  for (const t of kpiLines) {
    addPageIfNeeded(7);
    doc.text(t, margin, y);
    y += 5.5;
  }
  y += 4;

  if (analytics.themes?.length) {
    addPageIfNeeded(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Themes detectes", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const themeStr = analytics.themes.join("  |  ");
    const wrapped = doc.splitTextToSize(themeStr, contentW);
    for (const line of wrapped) {
      addPageIfNeeded(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 4;
  }

  const barW = contentW - 48;
  const barH = 3.5;

  addPageIfNeeded(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Sentiments par type d'envoi (barres : pos. / neutre / neg.)", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Legende barres : vert = positif  |  gris = neutre / mixte  |  rouge = negatif",
    margin,
    y
  );
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const shipEntries = Object.entries(analytics.shipMap || {});
  for (const [type, v] of shipEntries) {
    addPageIfNeeded(11);
    const posPct = v.total ? (v.pos / v.total) * 100 : 0;
    const negPct = v.total ? (v.neg / v.total) * 100 : 0;
    const neuPct = v.total ? (v.neutral / v.total) * 100 : 0;
    doc.setTextColor(15, 23, 42);
    doc.text(truncateCell(type, 18), margin, y);
    drawStackedBar(doc, margin + 32, y - 2.5, barW, barH, posPct, neuPct, negPct);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`${v.total} avis`, margin + 32 + barW + 2, y);
    doc.setFontSize(9);
    y += 8;
  }
  y += 4;

  const topCities = Object.entries(analytics.cityMap || {})
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  addPageIfNeeded(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Top 5 villes (part positif / negatif)", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const [city, v] of topCities) {
    addPageIfNeeded(11);
    const posPct = v.total ? (v.pos / v.total) * 100 : 0;
    const negPct = v.total ? (v.neg / v.total) * 100 : 0;
    const neuPct = v.total ? (v.neutral / v.total) * 100 : 0;
    doc.setTextColor(15, 23, 42);
    doc.text(truncateCell(city, 20), margin, y);
    drawStackedBar(doc, margin + 38, y - 2.5, barW - 6, barH, posPct, neuPct, negPct);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`${Math.round(posPct)}% pos.`, margin + 38 + barW - 4, y);
    doc.setFontSize(9);
    y += 8;
  }
  y += 6;

  addPageIfNeeded(28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Tendances et alertes", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const blocks = [
    ["Delais / livraison", analytics.insights?.delays],
    ["Service", analytics.insights?.service],
    ["Hybridite linguistique", analytics.insights?.hybrid],
  ];
  for (const [label, text] of blocks) {
    if (!text) continue;
    addPageIfNeeded(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}`, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const paras = doc.splitTextToSize(String(text), contentW);
    for (const ln of paras) {
      addPageIfNeeded(5);
      doc.text(ln, margin, y);
      y += 4.5;
    }
    y += 3;
  }

  doc.setFontSize(10);
  addPageIfNeeded(30);

  const sorted = [...data].sort((a, b) => a.id - b.id);
  const body = sorted.map((r) => [
    String(r.id),
    truncateCell(r.full_name, 80),
    truncateCell(r.city, 40),
    truncateCell(r.shipment_type, 24),
    truncateCell(r.last_order_date, 20),
    truncateCell(r.comment, 800),
    String(analytics.sentimentMap[r.id] ?? "neutral"),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Nom", "Ville", "Type", "Date", "Commentaire", "Sentiment"]],
    body,
    styles: {
      fontSize: 7,
      cellPadding: 1.2,
      overflow: "linebreak",
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 9 },
      1: { cellWidth: 26 },
      2: { cellWidth: 22 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20 },
      5: { cellWidth: 65 },
      6: { cellWidth: 22 },
    },
    margin: { left: margin, right: margin },
  });

  doc.save(safePdfFilename(fileName));
}
