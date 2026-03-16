export default function FormCard({ text, setText, handleAnalyze, loading }) {
    return (
        <div className="form-card">
            <textarea
            className="textarea"
            placeholder="Entrez votre message en dialecte franco-algérien (Darija + Français)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
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