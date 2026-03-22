export default function About() {
  return (
    <div className="ac-card about-card-new">
      <div className="ac-section-title">
        <span className="ac-section-title-text">À propos de HybridEmotion DZ</span>
      </div>

      <p className="about-text-new">
        HybridEmotion DZ analyse les messages en dialecte franco‑algérien (Darija + Français)
        pour comprendre comment les langues se mélangent et quelles émotions se dégagent.
      </p>

      <ul className="about-list-new">
        <li>Analyse le mélange entre français et arabe algérien.</li>
        <li>Calcule l'Indice d'Hybridité Linguistique (IHL).</li>
        <li>Mesure le sentiment global et l'intensité émotionnelle.</li>
        <li>Visualise la répartition des langues avec des graphiques dédiés.</li>
        <li>Met en évidence les mots par langue dans une heatmap interactive.</li>
      </ul>

      <p className="about-text-new">
        L'objectif est de rendre visible la richesse du code‑switching franco‑algérien
        dans les conversations du quotidien.
      </p>
    </div>
  );
}
