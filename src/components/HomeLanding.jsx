import { Link } from "react-router-dom";

export default function HomeLanding() {
  return (
    <div className="content home-landing">
      <div className="card home-card">
        <h2 className="home-title">HybridEmotion <span>DZ</span></h2>
        <p className="home-desc">
          Plateforme d'analyse linguistique et émotionnelle pour le dialecte franco-algérien.
          Choisissez l'outil adapté à votre besoin.
        </p>
        <div className="home-buttons">
          <Link to="/analyze" className="home-btn home-btn-primary">
            Analyser IHL
          </Link>
          <Link to="/clients" className="home-btn home-btn-secondary">
            Analyser Clients
          </Link>
        </div>
        <p className="home-hint">
          <strong>IHL</strong> : analyse de texte unique (Indice d'Hybridité Linguistique).
          <br />
          <strong>Clients</strong> : import CSV et analyse des avis clients en masse.
        </p>
      </div>
    </div>
  );
}
