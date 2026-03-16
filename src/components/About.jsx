export default function About() {
  return (
    <div className="card about-card">
      <div className="card-title about-title">À propos de HybridEmotion DZ</div>

      <p className="about-text">
        HybridEmotion DZ analyse les messages en dialecte franco‑algérien (Darija + Français)
        pour comprendre comment les langues se mélangent et quelles émotions se dégagent.
      </p>

      <ul className="about-list">
        <li>Analyse le mélange entre français et arabe algérien.</li>
        <li>Calcule l’Indice d’Hybridité Linguistique (IHL).</li>
        <li>Mesure le sentiment global et l’intensité émotionnelle.</li>
        <li>Visualise la répartition des langues avec des graphiques dédiés.</li>
        <li>Met en évidence les mots par langue dans une heatmap interactive.</li>
      </ul>

      <p className="about-text">
        L’objectif est de rendre visible la richesse du code‑switching franco‑algérien
        dans les conversations du quotidien.
      </p>
    </div>
  );
}

