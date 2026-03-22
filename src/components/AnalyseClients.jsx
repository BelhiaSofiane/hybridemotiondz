import { useState, useRef, useCallback } from "react";
import { analyzeClientsDataset } from "../services/clientsAnalyze";
import {
  computeDashboardAnalytics,
  emptyDashboardAnalytics,
} from "../utils/clientDashboardAnalytics";

// ─── Static dataset (démo → envoi à l’API OpenAI) ────────────────────────────
const STATIC_DATA = [
  { id: 1,  full_name: "Amine Benali",          city: "Algiers",    shipment_type: "Express",  last_order_date: "2026-02-12", comment: "service chaba bezaf w waslat b sr3a" },
  { id: 2,  full_name: "Sarah Mekki",            city: "Oran",       shipment_type: "Standard", last_order_date: "2026-01-28", comment: "taakhrat chwiya bsah waslat salma" },
  { id: 3,  full_name: "Yacine Boudiaf",         city: "Constantine",shipment_type: "Express",  last_order_date: "2026-03-01", comment: "tracking mli7 3ajbni" },
  { id: 4,  full_name: "Nadia Zeroual",          city: "Blida",      shipment_type: "Standard", last_order_date: "2026-02-15", comment: "service client kan mli7" },
  { id: 5,  full_name: "Karim Touati",           city: "Annaba",     shipment_type: "Freight",  last_order_date: "2026-02-20", comment: "chargement kbir w t3amlo m3ah b ni9a" },
  { id: 6,  full_name: "Samir Haddad",           city: "Tlemcen",    shipment_type: "Express",  last_order_date: "2026-03-05", comment: "service سريع بزاف" },
  { id: 7,  full_name: "Lina Bensalem",          city: "Oran",       shipment_type: "Standard", last_order_date: "2026-02-09", comment: "ykhdem bsah y9dro yhsno lw9t" },
  { id: 8,  full_name: "Riad Cherif",            city: "Algiers",    shipment_type: "Freight",  last_order_date: "2026-01-30", comment: "hafdo 3la lproduit mlih" },
  { id: 9,  full_name: "Imane Khelifi",          city: "Setif",      shipment_type: "Express",  last_order_date: "2026-03-02", comment: "wsalt b sr3a 3jbatni" },
  { id: 10, full_name: "Walid Ghezali",          city: "Batna",      shipment_type: "Standard", last_order_date: "2026-02-18", comment: "packaging kan 3adi" },
  { id: 11, full_name: "Fatih Rebbah",           city: "Algiers",    shipment_type: "Express",  last_order_date: "2026-03-06", comment: "khadma kamla sahla" },
  { id: 12, full_name: "Asma Bouzid",            city: "Oran",       shipment_type: "Freight",  last_order_date: "2026-02-25", comment: "radit 3la service ta3hom" },
  { id: 13, full_name: "Mehdi Oukil",            city: "Bejaia",     shipment_type: "Standard", last_order_date: "2026-02-11", comment: "taakhr b zouj ayam" },
  { id: 14, full_name: "Karima Hamdi",           city: "Skikda",     shipment_type: "Express",  last_order_date: "2026-03-04", comment: "thiqt fihom service mli7" },
  { id: 15, full_name: "Reda Amrani",            city: "Tizi Ouzou", shipment_type: "Standard", last_order_date: "2026-01-29", comment: "tracking btiii chwiya" },
  { id: 16, full_name: "Farah Saidi",            city: "Algiers",    shipment_type: "Express",  last_order_date: "2026-03-07", comment: "t3amlo m3aya b ihtiram" },
  { id: 17, full_name: "Anis Djerbi",            city: "Oran",       shipment_type: "Freight",  last_order_date: "2026-02-22", comment: "chargement t3amel m3ah b احتراف" },
  { id: 18, full_name: "Salma Kaci",             city: "Constantine",shipment_type: "Standard", last_order_date: "2026-02-16", comment: "livreur kan mrbbi" },
  { id: 19, full_name: "Nassim Belaid",          city: "Annaba",     shipment_type: "Express",  last_order_date: "2026-03-03", comment: "sr3a w khadma ndifa" },
  { id: 20, full_name: "Hana Benyahia",          city: "Blida",      shipment_type: "Standard", last_order_date: "2026-02-13", comment: "3adi ma fih walo" },
  { id: 21, full_name: "Lotfi Brahimi",          city: "Algiers",    shipment_type: "Freight",  last_order_date: "2026-02-27", comment: "service khra taakhr bzf w ma yrdouch 3la tel" },
  { id: 22, full_name: "Ines Boulahia",          city: "Oran",       shipment_type: "Express",  last_order_date: "2026-03-01", comment: "3jbatni bezaf" },
  { id: 23, full_name: "Mourad Ziani",           city: "Setif",      shipment_type: "Standard", last_order_date: "2026-02-19", comment: "y9dro ykouno asra3" },
  { id: 24, full_name: "Amel Kerroum",           city: "Batna",      shipment_type: "Express",  last_order_date: "2026-03-05", comment: "wsalt f wa9tha parfait" },
  { id: 25, full_name: "Sofiane Kaddour",        city: "Tlemcen",    shipment_type: "Freight",  last_order_date: "2026-02-21", comment: "organisation mliha" },
  { id: 26, full_name: "Yasmine Bouchelaghem",   city: "Algiers",    shipment_type: "Standard", last_order_date: "2026-02-08", comment: "taakhr chwiya bsah mchi mochkil" },
  { id: 27, full_name: "Adel Benaissa",          city: "Oran",       shipment_type: "Express",  last_order_date: "2026-03-06", comment: "service top" },
  { id: 28, full_name: "Nawal Hamouche",         city: "Bejaia",     shipment_type: "Standard", last_order_date: "2026-02-14", comment: "kolchi normal" },
  { id: 29, full_name: "Rachid Djaafar",         city: "Skikda",     shipment_type: "Freight",  last_order_date: "2026-02-23", comment: "t3amlo m3ah mlih" },
  { id: 30, full_name: "Samia Bensouda",         city: "Tizi Ouzou", shipment_type: "Express",  last_order_date: "2026-03-02", comment: "tjriba chaba" },
  { id: 31, full_name: "Hocine Allam",           city: "Algiers",    shipment_type: "Standard", last_order_date: "2026-02-17", comment: "packaging y9dro yhsnoh" },
  { id: 32, full_name: "Malek Kherfi",           city: "Oran",       shipment_type: "Express",  last_order_date: "2026-03-04", comment: "sr3a fi livraison" },
  { id: 33, full_name: "Abir Loucif",            city: "Constantine",shipment_type: "Freight",  last_order_date: "2026-02-24", comment: "chargement kbir mli7" },
  { id: 34, full_name: "Farid Bekkouche",        city: "Annaba",     shipment_type: "Standard", last_order_date: "2026-02-10", comment: "taakhr chwiya" },
  { id: 35, full_name: "Loubna Djeriou",         city: "Blida",      shipment_type: "Express",  last_order_date: "2026-03-07", comment: "service hayel" },
  { id: 36, full_name: "Amar Saad",              city: "Tlemcen",    shipment_type: "Freight",  last_order_date: "2026-02-28", comment: "khadma b niveau" },
  { id: 37, full_name: "Nour Belkacem",          city: "Setif",      shipment_type: "Standard", last_order_date: "2026-02-12", comment: "3adi" },
  { id: 38, full_name: "Ismail Khelil",          city: "Batna",      shipment_type: "Express",  last_order_date: "2026-03-03", comment: "sr3a kbira" },
  { id: 39, full_name: "Rim Bouchareb",          city: "Algiers",    shipment_type: "Freight",  last_order_date: "2026-02-26", comment: "amane w mlih" },
  { id: 40, full_name: "Karim Bouaziz",          city: "Oran",       shipment_type: "Standard", last_order_date: "2026-02-15", comment: "taakhr" },
  { id: 41, full_name: "Samah Ziani",            city: "Bejaia",     shipment_type: "Express",  last_order_date: "2026-03-06", comment: "parfait" },
  { id: 42, full_name: "Adlane Meftah",          city: "Skikda",     shipment_type: "Freight",  last_order_date: "2026-02-22", comment: "mli7 bzf" },
  { id: 43, full_name: "Hind Ait Ali",           city: "Tizi Ouzou", shipment_type: "Standard", last_order_date: "2026-02-18", comment: "y7taj ythssen" },
  { id: 44, full_name: "Tarek Benamar",          city: "Algiers",    shipment_type: "Express",  last_order_date: "2026-03-05", comment: "khadma rapide" },
  { id: 45, full_name: "Nabila Ould",            city: "Oran",       shipment_type: "Freight",  last_order_date: "2026-02-20", comment: "hafdo 3la produit" },
  { id: 46, full_name: "Zakaria Boudjemaa",      city: "Setif",      shipment_type: "Standard", last_order_date: "2026-02-11", comment: "3adi" },
  { id: 47, full_name: "Sonia Derradji",         city: "Batna",      shipment_type: "Express",  last_order_date: "2026-03-07", comment: "service رائع" },
  { id: 48, full_name: "Youssef Merabet",        city: "Annaba",     shipment_type: "Freight",  last_order_date: "2026-02-25", comment: "organisation mliha" },
  { id: 49, full_name: "Khadija Saad",           city: "Blida",      shipment_type: "Standard", last_order_date: "2026-02-13", comment: "service zbel w ma n3awedch n3amel m3ahom" },
  { id: 50, full_name: "Ali Hamani",             city: "Tlemcen",    shipment_type: "Express",  last_order_date: "2026-03-06", comment: "raani mradhi bsah ghali bzf" },
];

// ─── CSV parser (guillemets et virgules dans les champs) ─────────────────────
function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseCSV(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim().length);
  if (lines.length < 2) throw new Error("CSV invalide : besoin d’en-tête + données");
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line, idx) => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (vals[i] ?? "").trim();
    });
    const idRaw = obj.id ?? obj["#"];
    const idNum = Number(idRaw);
    const id = Number.isFinite(idNum) && idNum > 0 ? idNum : idx + 1;
    return {
      id,
      full_name: obj.full_name ?? obj.nom ?? "",
      city: obj.city ?? obj.ville ?? "",
      shipment_type: obj.shipment_type ?? obj.type ?? "",
      last_order_date: obj.last_order_date ?? obj.date ?? "",
      comment: obj.comment ?? obj.commentaire ?? "",
    };
  });
}

// ─── Donut (pure SVG) ─────────────────────────────────────────────────────────
function Donut({ segments, size = 120, stroke = 18, label, sublabel }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  let   offset = 0;
  const cx     = size / 2;
  const cy     = size / 2;
  const slices = segments.map(s => {
    const len   = (s.pct / 100) * circ;
    const slice = { ...s, dasharray: `${len} ${circ - len}`, dashoffset: -offset };
    offset += len;
    return slice;
  });
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={s.dasharray} strokeDashoffset={s.dashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {label    && <span style={{ fontSize: size < 100 ? 16 : 22, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{label}</span>}
        {sublabel && <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ color, bg, children, size = "md" }) {
  return (
    <span className={`pill pill-${size}`} style={{ background: bg, color }}>
      {children}
    </span>
  );
}

// ─── SentimentBadge ───────────────────────────────────────────────────────────
const SENT_MAP = {
  positive: { bg: "#dcfce7", color: "#15803d", icon: "😊" },
  negative: { bg: "#fee2e2", color: "#dc2626", icon: "😠" },
  mixed:    { bg: "#fefce8", color: "#b45309", icon: "😐" },
  neutral:  { bg: "#f1f5f9", color: "#64748b", icon: "😶" },
};
function SentimentBadge({ sentiment }) {
  const m = SENT_MAP[sentiment] || SENT_MAP.neutral;
  return <Pill bg={m.bg} color={m.color} size="sm">{m.icon} {sentiment}</Pill>;
}

// ─── MiniBar ──────────────────────────────────────────────────────────────────
function MiniBar({ label, pos, neg, neutral, total }) {
  const posW = Math.round((pos / total) * 100);
  const negW = Math.round((neg / total) * 100);
  const neuW = 100 - posW - negW;
  return (
    <div className="ac-minibar">
      <div className="ac-minibar-header">
        <span className="ac-minibar-label">{label}</span>
        <span className="ac-minibar-count">{total} avis</span>
      </div>
      <div className="ac-minibar-track">
        {posW > 0 && <div className="ac-minibar-pos" style={{ width: `${posW}%` }} />}
        {neuW > 0 && <div className="ac-minibar-neu" style={{ width: `${neuW}%` }} />}
        {negW > 0 && <div className="ac-minibar-neg" style={{ width: `${negW}%` }} />}
      </div>
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
function SectionTitle({ children, action }) {
  return (
    <div className="ac-section-title">
      <span className="ac-section-title-text">{children}</span>
      {action}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function AnalyseClients() {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState(() => emptyDashboardAnalytics());
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("—");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("Toutes");
  const [filterShip, setFilterShip] = useState("Tous");
  const [filterSent, setFilterSent] = useState("Tous");
  const [showTable, setShowTable] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfBusyRef = useRef(false);
  const [inputText, setInputText] = useState(
    "Fal tafhem! Ce produit c'est une dinguerie, j'ador\n" +
    "Mais houma 3anda probléme f livraison, hadak\n" +
    "li ychouf, mazalna n9esin f délais, ça dégoûte 😒"
  );
  const fileRef = useRef();

  const runAnalysis = useCallback(async (rows) => {
    if (!rows?.length) {
      setError("Aucune ligne à analyser. Importez un CSV ou lancez la démo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const api = await analyzeClientsDataset(rows);
      setAnalytics(computeDashboardAnalytics(rows, api));
      setAnalyzed(true);
    } catch (e) {
      console.error(e);
      setError(e.message ?? "Erreur lors de l’analyse OpenAI");
      setAnalyzed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target.result);
        setData(parsed);
        setAnalyzed(false);
        setAnalytics(emptyDashboardAnalytics());
        void runAnalysis(parsed);
      } catch (err) {
        alert(err.message ?? "Erreur de lecture CSV");
      }
    };
    reader.readAsText(file);
  }, [runAnalysis]);

  const cities = ["Toutes", ...Array.from(new Set(data.map(r => r.city))).sort()];
  const ships  = ["Tous", "Express", "Standard", "Freight"];
  const sents  = ["Tous", "positive", "neutral", "negative", "mixed"];

  const filteredData = data.filter((r) => {
    const s = analytics.sentimentMap[r.id] ?? "neutral";
    return (
      (filterCity === "Toutes" || r.city          === filterCity) &&
      (filterShip === "Tous"   || r.shipment_type === filterShip) &&
      (filterSent === "Tous"   || s               === filterSent) &&
      (searchTerm === ""       ||
        r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const topCities = Object.entries(analytics.cityMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const handleDownloadPdf = useCallback(async () => {
    if (!analyzed || !data.length || pdfBusyRef.current) return;
    pdfBusyRef.current = true;
    setPdfBusy(true);
    try {
      const { downloadClientsAnalysisPdf } = await import("../utils/clientsReportPdf.js");
      downloadClientsAnalysisPdf({ fileName, data, analytics });
    } catch (e) {
      console.error(e);
      alert(e?.message ?? "Impossible de générer le PDF.");
    } finally {
      pdfBusyRef.current = false;
      setPdfBusy(false);
    }
  }, [analyzed, data, fileName, analytics]);

  const shipPillStyle = (type) =>
    type === "Express" ? { bg: "#fff4ee", color: "#f97316" } :
    type === "Freight" ? { bg: "#f5f3ff", color: "#8b5cf6" } :
                         { bg: "#f1f5f9", color: "#64748b" };

  return (
    <div className="ac-root">
      {pdfBusy && (
        <div className="ac-pdf-busy-overlay" role="status" aria-live="polite">
          <span className="ac-pdf-busy-inner">Génération du PDF…</span>
        </div>
      )}

      <main className="ac-body">

        {/* ── Import Zone ── */}
        <div
          className={`ac-card ac-import-card${isDragging ? " dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <div className="ac-import-row">
            <div className="ac-import-info">
              <div className="ac-import-label">📂 Fichier chargé</div>
              <div className="ac-import-filename">{fileName}</div>
            </div>
            <div className="ac-import-btns">
              <button className="ac-btn-primary" onClick={() => fileRef.current.click()}>
                ⬆ Importer CSV
              </button>
              <button
                type="button"
                className="ac-btn-secondary"
                disabled={loading}
                onClick={() => {
                  setData(STATIC_DATA);
                  setFileName("données_clients_demo.csv");
                  setAnalyzed(false);
                  setAnalytics(emptyDashboardAnalytics());
                  void runAnalysis(STATIC_DATA);
                }}
              >
                🔄 Démo
              </button>
              <button
                type="button"
                className="ac-btn-pdf"
                disabled={loading || pdfBusy || !analyzed || !data.length}
                title={
                  !analyzed || !data.length
                    ? "Lancez d’abord une analyse"
                    : "Télécharger le rapport (graphiques + tableau)"
                }
                onClick={() => void handleDownloadPdf()}
              >
                {pdfBusy ? "PDF…" : "📄 Télécharger PDF"}
              </button>
            </div>
          </div>
          <div className="ac-import-hint">
            Glissez un fichier CSV ici · Format attendu :{" "}
            <code>id, full_name, city, shipment_type, last_order_date, comment</code>
          </div>
          {error && (
            <div className="error-msg" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>

        {/* ── KPI Cards ── */}
        <div className="ac-kpi-grid">
          {[
            { icon: "📋", value: loading ? "…" : analytics.total, label: "Analyses", sub: analyzed ? "OpenAI · Zod" : "En attente", color: "#0ea5e9", bg: "#e0f6ff" },
            { icon: "😊", value: `${analytics.posRatio}%`,   label: "Positif",   sub: `${analytics.pos} avis`, color: "#22c55e", bg: "#dcfce7" },
            { icon: "😡", value: `${analytics.negRatio}%`,   label: "Négatif",   sub: `${analytics.neg} avis`, color: "#ef4444", bg: "#fee2e2" },
            { icon: "🌐", value: `${analytics.ihl}%`,        label: "IHL Score", sub: "Indice hybride",         color: "#8b5cf6", bg: "#f5f3ff" },
          ].map((k, i) => (
            <div key={i} className="ac-card ac-kpi-card">
              <div className="ac-kpi-icon" style={{ background: k.bg }}>{k.icon}</div>
              <div>
                <div className="ac-kpi-value" style={{ color: k.color }}>{k.value}</div>
                <div className="ac-kpi-label">{k.label}</div>
                <div className="ac-kpi-sub">{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Analysis Input + Donut Charts ── */}
        <div className="ac-analysis-row">

          {/* Text input card */}
          <div className="ac-card">
            <SectionTitle action={
              <div className="ac-analyse-actions">
                <button
                  type="button"
                  className="ac-btn-analyse"
                  disabled={loading || !data.length}
                  onClick={() => void runAnalysis(data)}
                >
                  {loading ? "Analyse…" : "Analyser"}
                </button>
                <button type="button" className="ac-btn-lomat">Lomàt vetòhes ▶</button>
              </div>
            }>
              ✍️ Analyse des clients
            </SectionTitle>
            <div className="ac-comment-preview">
              Fal tafhem!{" "}
              <Pill bg="#d1fae5" color="#059669" size="sm">Ce produit</Pill>{" "}
              c'est une dinguerie, j'ador<br />
              <span className="ac-comment-highlight">Mais houma 3anda probléme f livraison</span>, hadak<br />
              li ychouf, mazalna n9esin f délais, ça dégoûte 😒
            </div>
            <textarea className="ac-textarea" value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Saisissez ou collez un avis client en Darija, Français, ou Arabic…" />
          </div>

          {/* Donut charts column */}
          <div className="ac-donut-col">

            <div className="ac-card">
              <SectionTitle>Indice Hybride Ling.</SectionTitle>
              <div className="ac-donut-inner">
                <Donut size={100} stroke={14} label={`${analytics.ihl}%`}
                  segments={[
                    { pct: Math.max(0, analytics.frenchPct), color: "#3b82f6" },
                    { pct: Math.max(0, analytics.algerianPct), color: "#f97316" },
                  ]} />
                <div>
                  <div className="ac-donut-pills">
                    <Pill bg="#e0f6ff" color="#0ea5e9">🇫🇷 Français {analytics.frenchPct}%</Pill>
                    <Pill bg="#fff4ee" color="#f97316">🇩🇿 Algérien {analytics.algerianPct}%</Pill>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Pill bg="#fef3c7" color="#b45309" size="sm">⚡ {analytics.intensityLabel}</Pill>
                  </div>
                </div>
              </div>
            </div>

            <div className="ac-card">
              <SectionTitle>Profil émotionnel</SectionTitle>
              <div className="ac-donut-inner">
                <Donut size={100} stroke={14} label={`${analytics.posRatio}%`}
                  segments={[
                    { pct: analytics.posRatio,     color: "#22c55e" },
                    { pct: analytics.neutralRatio, color: "#94a3b8" },
                    { pct: analytics.negRatio,     color: "#ef4444" },
                  ]} />
                <div className="ac-emotion-legend">
                  <div className="ac-emotion-row"><span className="ac-dot" style={{ background: "#22c55e" }} /><b>{analytics.posRatio}%</b>&nbsp;positif</div>
                  <div className="ac-emotion-row"><span className="ac-dot" style={{ background: "#94a3b8" }} /><b>{analytics.neutralRatio}%</b>&nbsp;neutre</div>
                  <div className="ac-emotion-row"><span className="ac-dot" style={{ background: "#ef4444" }} /><b>{analytics.negRatio}%</b>&nbsp;négatif</div>
                  <div className="ac-emotion-themes">
                    {analytics.themes?.length
                      ? analytics.themes.slice(0, 4).join(" · ")
                      : "Thèmes après analyse"}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Sentiment by Shipment + City Emotions ── */}
        <div className="ac-charts-grid">

          <div className="ac-card">
            <SectionTitle>Sentiments par type d'envoi</SectionTitle>
            {!Object.keys(analytics.shipMap).length && (
              <p className="ac-import-filename">Importez des données pour voir les barres.</p>
            )}
            {Object.entries(analytics.shipMap).map(([type, v]) => (
              <MiniBar key={type} label={type} pos={v.pos} neg={v.neg}
                neutral={v.neutral} total={v.total} />
            ))}
            <div className="ac-bar-legend">
              {[["Positif","#22c55e"],["Neutre","#94a3b8"],["Négatif","#ef4444"]].map(([l, c]) => (
                <div key={l} className="ac-bar-legend-item">
                  <span className="ac-bar-legend-dot" style={{ background: c }} />{l}
                </div>
              ))}
            </div>
          </div>

          <div className="ac-card">
            <SectionTitle>Émotions par région</SectionTitle>
            {!topCities.length && (
              <p className="ac-import-filename">Pas encore de données par ville.</p>
            )}
            {topCities.map(([city, v]) => {
              const posW = Math.round((v.pos / v.total) * 100);
              const negW = Math.round((v.neg / v.total) * 100);
              return (
                <div key={city} className="ac-region-row">
                  <div className="ac-region-header">
                    <span className="ac-region-label">{city}</span>
                    <span className="ac-region-score">{posW}% 😊</span>
                  </div>
                  <div className="ac-region-track">
                    <div className="ac-region-pos" style={{ width: `${posW}%` }} />
                    <div className="ac-region-neg" style={{ width: `${negW}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── Trends & Alerts ── */}
        <div className="ac-card ac-trends-card">
          <SectionTitle action={<button className="ac-section-link">Voir tout →</button>}>
            📊 Tendances &amp; alertes
          </SectionTitle>
          <div className="ac-trends-grid">
            <div className="ac-alert-card warn">
              <div className="ac-alert-icon" style={{ background: "#fff4ee" }}>🚨</div>
              <div>
                <div className="ac-alert-title">
                  #delai_livraison{" "}
                  <Pill bg="#fff4ee" color="#f97316" size="sm">📋 {analytics.delayMentions}</Pill>
                </div>
                <div className="ac-alert-desc">{analytics.insights?.delays}</div>
              </div>
            </div>
            <div className="ac-alert-card good">
              <div className="ac-alert-icon" style={{ background: "#dcfce7" }}>✅</div>
              <div>
                <div className="ac-alert-title">
                  #service_rapide{" "}
                  <Pill bg="#dcfce7" color="#22c55e" size="sm">📋 {analytics.pos}</Pill>
                </div>
                <div className="ac-alert-desc">{analytics.insights?.service || "Synthèse issue des sentiments agrégés."}</div>
              </div>
            </div>
            <div className="ac-alert-card info">
              <div className="ac-alert-icon" style={{ background: "#f5f3ff" }}>🌐</div>
              <div>
                <div className="ac-alert-title">
                  #hybridité_ling.{" "}
                  <Pill bg="#f5f3ff" color="#8b5cf6" size="sm">IHL {analytics.ihl}%</Pill>
                </div>
                <div className="ac-alert-desc">{analytics.insights?.hybrid}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="ac-card">
          <SectionTitle action={
            <button className="ac-btn-ghost" onClick={() => setShowTable(p => !p)}>
              {showTable ? "▲ Masquer" : "▼ Voir les données"}
            </button>
          }>
            🗃️ Tableau des clients ({filteredData.length}/{data.length})
          </SectionTitle>

          {/* Filters */}
          <div className="ac-filters">
            <input className="ac-search" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher nom ou commentaire…" />
            {[
              { val: filterCity, set: setFilterCity, opts: cities },
              { val: filterShip, set: setFilterShip, opts: ships },
              { val: filterSent, set: setFilterSent, opts: sents },
            ].map((f, i) => (
              <select key={i} className="ac-select" value={f.val}
                onChange={e => f.set(e.target.value)}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>

          {/* Table */}
          {showTable && (
            <div className="ac-table-wrap">
              <table className="ac-table">
                <thead>
                  <tr>
                    {["#","Nom","Ville","Type","Date","Commentaire","Sentiment"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(r => {
                    const sc = shipPillStyle(r.shipment_type);
                    return (
                      <tr key={r.id}>
                        <td className="ac-td-id">{r.id}</td>
                        <td className="ac-td-name">{r.full_name}</td>
                        <td><Pill bg="#e0f6ff" color="#0ea5e9" size="sm">{r.city}</Pill></td>
                        <td><Pill bg={sc.bg} color={sc.color} size="sm">{r.shipment_type}</Pill></td>
                        <td className="ac-td-date">{r.last_order_date}</td>
                        <td className="ac-td-comment" title={r.comment}>{r.comment}</td>
                        <td><SentimentBadge sentiment={analytics.sentimentMap[r.id] ?? "neutral"} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="ac-empty">Aucun résultat pour ces filtres</div>
              )}
            </div>
          )}

          {/* Summary pills when table is hidden */}
          {!showTable && (
            <div className="ac-summary-pills">
              <Pill bg="#dcfce7" color="#15803d">😊 {analytics.pos} positifs</Pill>
              <Pill bg="#fee2e2" color="#dc2626">😠 {analytics.neg} négatifs</Pill>
              <Pill bg="#f1f5f9" color="#64748b">😶 {analytics.neutral + analytics.mixed} neutres/mixtes</Pill>
              <Pill bg="#e0f6ff" color="#0ea5e9">🏙️ {Object.keys(analytics.cityMap).length} villes</Pill>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
