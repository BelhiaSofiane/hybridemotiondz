export default function AnalyzeForm({ text, setText, handleAnalyze, loading }) {
    return (
        <div className="form-card">
            <textarea
                className="textarea"
                placeholder="Entrez votre texte hybride franco-algérien..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
            >
                {loading ? "Analyse en cours…" : "Analyser"}
            </button>
        </div>
    );
}