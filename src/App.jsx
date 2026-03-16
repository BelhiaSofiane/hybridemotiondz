import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import FormCard from "./components/FormCard";
import Loader from "./components/Loader";
import Results from "./components/Results";
import About from "./components/About";
import SlidingMenu from "./components/SlidingMenu";

import { analyzeText } from "./services/openai"; // ← all AI logic lives here now

function App() {
  const [text, setText] = useState("");
  const [analysisData, setAnalysisData] = useState(null); // null = no results yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("analyze"); // "analyze" | "about"

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
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
        alert("Résumé de l'analyse copié dans le presse‑papier.");
      } else {
        alert(summary);
      }
    } catch (e) {
      console.error("Erreur partage:", e);
    }
  };

  const handleGeneratePdf = () => {
    if (!analysisData) return;
    window.print();
  };

  const handleNavigate = (target) => {
    setView(target);
    setMenuOpen(false);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeText(text);
      setAnalysisData(result);
    } catch (err) {
      console.error("Erreur analyse:", err);
      setError("Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone">
      <Header onMenuToggle={() => setMenuOpen(true)} />

      <SlidingMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        currentView={view}
      />

      {view === "about" ? (
        <div className="content">
          <About />
        </div>
      ) : (
        <div className="content content-layout">
          <div className="content-left">
            <FormCard
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
              />
            ) : (
              <div className="card empty-state">
                <div className="card-title">Indice d'Hybridité Linguistique – franco-algérien</div>
                <p className="empty-state-text">
                  Collez un message en dialecte franco-algérien (Darija + Français) à gauche puis cliquez sur
                  <span className="empty-state-accent"> Analyser</span> pour obtenir :
                </p>
                <ul className="empty-state-list">
                  <li>• Un score d’hybridité (IHL) de 0 à 100</li>
                  <li>• La répartition français / algérien</li>
                  <li>• Une lecture émotionnelle et d’intensité</li>
                  <li>• Une heatmap des mots par langue</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;