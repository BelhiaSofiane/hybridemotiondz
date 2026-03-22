export default function AnalyzeForm({ text, setText, handleAnalyze, loading }) {
  return (
    <div className="ac-card ac-analyze-form-card">
      <div className="ac-section-title">
        <span className="ac-section-title-text">✍️ Analyse IHL</span>
      </div>
      <p className="ac-form-hint">
        Collez un message en dialecte franco-algérien (Darija + Français) pour analyser l'hybridité linguistique.
      </p>
      <textarea
        className="ac-textarea"
        placeholder="Entrez votre message en dialecte franco-algérien..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
      <div className="ac-analyse-actions">
        <button
          type="button"
          className="ac-btn-analyse"
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
        >
          {loading ? "Analyse en cours…" : "Analyser"}
        </button>
      </div>
    </div>
  );
}
