import { useState, useRef, useCallback } from "react";
import AnalyzeForm from "../components/AnalyzeForm";
import Loader from "../components/Loader";
import Results from "../components/Results";
import { analyzeIhlText } from "../services/openai";

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfBusyRef = useRef(false);

  const handleShare = async () => {
    if (!analysisData) return;

    const d = analysisData;
    const summary = [
      "Indice d'Hybridité Linguistique – franco-algérien",
      `• IHL : ${d.ihl}%`,
      `• Répartition : Algérien ${d.langues[0].pct}% / Français ${d.langues[1].pct}%`,
      `• Sentiment : ${d.sentiment.label} (${d.sentiment.score}%)`,
      `• Dominante : ${d.dominante}`,
      `• Intensité : ${d.intensite}`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Analyse franco‑algérienne",
          text: summary,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        alert("Résumé de l'analyse copié dans le presse‑papier.");
      } else {
        alert(summary);
      }
    } catch (e) {
      console.error("Erreur partage:", e);
    }
  };

  const handleGeneratePdf = useCallback(async () => {
    if (!analysisData || pdfBusyRef.current) return;
    pdfBusyRef.current = true;
    setPdfBusy(true);
    try {
      const { downloadIhlAnalysisPdf } = await import("../utils/ihlReportPdf.js");
      downloadIhlAnalysisPdf({ analysisData, text });
    } catch (e) {
      console.error(e);
      alert(e?.message ?? "Impossible de générer le PDF.");
    } finally {
      pdfBusyRef.current = false;
      setPdfBusy(false);
    }
  }, [analysisData, text]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeIhlText(text);
      setAnalysisData(result);
    } catch (err) {
      console.error("Erreur analyse:", err);
      setError("Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content content-layout" style={{ position: "relative" }}>
      {pdfBusy && (
        <div className="ac-pdf-busy-overlay" role="status" aria-live="polite">
          <span className="ac-pdf-busy-inner">Génération du PDF…</span>
        </div>
      )}
      <div className="content-left">
        <AnalyzeForm
          text={text}
          setText={setText}
          handleAnalyze={handleAnalyze}
          loading={loading}
        />

        {loading && <Loader />}

        {error && !loading && (
          <div className="error-msg">{error}</div>
        )}
      </div>

      <div className="content-right">
        {analysisData && !loading ? (
          <Results
            data={analysisData}
            onShare={handleShare}
            onGeneratePdf={handleGeneratePdf}
            pdfBusy={pdfBusy}
          />
        ) : (
          <div className="ac-card empty-state-card">
            <div className="ac-section-title-text">Indice d'Hybridité Linguistique – franco-algérien</div>
            <p className="empty-state-text">
              Collez un message en dialecte franco-algérien (Darija + Français) à gauche puis cliquez sur
              <span className="empty-state-accent"> Analyser</span> pour obtenir :
            </p>
            <ul className="empty-state-list">
              <li>• Un score d'hybridité (IHL) de 0 à 100</li>
              <li>• La répartition français / algérien</li>
              <li>• Une lecture émotionnelle et d'intensité</li>
              <li>• Une heatmap des mots par langue</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
