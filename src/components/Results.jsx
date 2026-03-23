import Donut from "../assets/Donut";
import Pill from "../assets/Pill";

export default function Results({ data, onShare, onGeneratePdf, pdfBusy = false }) {

    const d = data; // real AI data, same shape as DUMMY

    const ihlLevel =
        d.ihl < 25 ? "hybridité faible" :
            d.ihl < 60 ? "hybridité modérée" :
                "hybridité élevée";

    const ihlComment =
        d.ihl < 25
            ? "Le message est plutôt monolingue avec quelques touches de code-switching."
            : d.ihl < 60
                ? "Le message mélange régulièrement français et algérien : hybridité typique d’un échange informel."
                : "Le message est fortement hybride avec un code-switching quasi permanent entre les langues.";

    return (
        <div className="results-root">
            <div className="section-title">Résultats</div>

            {/* IHL Card */}
            <div className="card">
                <div className="card-title">
                    Indice d'Hybridité Linguistique <span>(IHL)</span>
                </div>

                <div className="ihl-header-row">
                    <span className="ihl-badge">{ihlLevel}</span>
                    <span className="ihl-range-text">
                        0% = monolingue · 50% = très hybride · 100% = code-switching extrême
                    </span>
                </div>

                <div className="ihl-inner">

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <Donut
                            segments={[
                                { pct: d.ihl, color: "#10b981" },
                                { pct: 100 - d.ihl, color: "#f97316" },
                            ]}
                            size={112}
                            stroke={10}
                            label={`${d.ihl}%`}
                        />

                        <div className="ihl-meta">
                            <div className="meta-item">
                                <div className="dot" style={{ background: "#10b981" }} />
                                {d.langues[0].pct}%
                            </div>

                            <div className="meta-item">
                                <div className="dot" style={{ background: "#f97316" }} />
                                {d.langues[1].pct}%
                            </div>
                        </div>
                    </div>

                    <div className="ihl-right">

                        <div className="lang-ratio">
                            Français ({d.langues[1].pct}%) / Algérien ({d.langues[0].pct}%)
                        </div>

                        <p className="ihl-comment">
                            {ihlComment}
                        </p>

                        <div className="pills-col">
                            <Pill color="#fff" bg="#10b981">
                                {d.sentiment.label} {d.sentiment.score}%
                            </Pill>

                            <Pill color="#fff" bg="#f97316">
                                {d.dominante}
                            </Pill>

                            <Pill color="#fff" bg="#3b82f6">
                                {d.intensite}
                            </Pill>
                        </div>

                        <div className="emotion-ring">
                            <Donut
                                segments={[
                                    { pct: d.emotionScore, color: "#f97316" },
                                    { pct: 100 - d.emotionScore, color: "#3b82f6" },
                                ]}
                                size={80}
                                stroke={10}
                                label={`${d.emotionScore}%`}
                            />
                            <div className="emotion-label">score émotion</div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Language Distribution */}
            <div className="card">
                <div className="card-title">Répartition des Langues</div>

                <div className="lang-row">
                    {d.langues.map((l) => (
                        <div
                            key={l.name}
                            className="lang-box"
                            style={{
                                background: l.color + "18",
                                border: `2px solid ${l.color}30`,
                            }}
                        >
                            <div>
                                <div className="lang-box-name" style={{ color: l.color }}>
                                    {l.name}
                                </div>
                                <div className="lang-box-pct" style={{ color: l.color }}>
                                    {l.pct}%
                                </div>
                            </div>
                            <span style={{ fontSize: 28 }}>{l.flag}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <div className="action-row">
                <button
                    className="action-btn btn-pdf"
                    onClick={onGeneratePdf}
                    disabled={pdfBusy}
                >
                    <span>📄</span> {pdfBusy ? "PDF…" : "GÉNÉRER PDF"}
                </button>

                <button className="action-btn btn-share" onClick={onShare}>
                    <span>↗</span> PARTAGER
                </button>
            </div>

            {/* Heatmap */}
            <div className="card">
                <div className="card-title">Heatmap linguistique</div>

                <div className="heatmap-text">
                    {d.tokens.map((t, i) => {
                        const cls =
                            t.lang === "ar"
                                ? "hm-ar"
                                : t.highlight
                                    ? "hm-fr"
                                    : "";

                        return cls
                            ? <span key={i} className={cls}>{t.word}</span>
                            : <span key={i}>{t.word}</span>;
                    })}
                </div>

                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: "#10b981" }} />
                        Algérien / Arabe
                    </div>

                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: "#f97316" }} />
                        Français
                    </div>
                </div>
            </div>
        </div>
    );
}