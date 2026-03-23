# HybridEmotion DZ

Analyse de sentiments et hybridité linguistique pour le marché algérien — Darija, Français et Arabe.

## 🎯 Objectif

Outil simple pour les entreprises algériennes afin de :
- Comprendre rapidement l’avis des clients
- Mesurer les sentiments (positif / négatif / neutre)
- Analyser la répartition linguistique (français vs arabe/darija)
- Exporter des rapports PDF sans coût élevé

## ✨ Fonctionnalités

### 1. Analyse IHL (Indice d’Hybridité Linguistique)
- **Route :** `/analyze`
- Collez un texte en dialecte franco-algérien (Darija + Français)
- Obtenez :
  - Score IHL (0–100 %)
  - Répartition Algérien / Français
  - Sentiment et intensité émotionnelle
  - Heatmap des mots par langue
- Export PDF (jsPDF)

### 2. Dashboard Clients
- **Route :** `/clients`
- **Import :** CSV ou copier-coller de commentaires (un par ligne)
- **Résultats :**
  - Nombre de commentaires
  - Pourcentage positif / négatif
  - IHL et langue dominante
  - Mots les plus fréquents
  - Liste des 5 commentaires les plus négatifs
  - Graphiques (donuts, barres)
- **Export :** rapport PDF avec conseils et recommandations

## 🛠️ Stack technique

- **Frontend :** React 19, Vite 7, React Router
- **Backend :** Netlify Functions (serverless)
- **IA :** OpenAI GPT-4o-mini (via API)
- **PDF :** jsPDF + jspdf-autotable

## 📦 Installation

```bash
git clone https://github.com/BelhiaSofiane/hybridemotiondz.git
cd HybridEmotionDz
npm install
```

Créez un fichier `.env` à la racine avec votre clé OpenAI :

```env
OPENAI_API_KEY=votre_clé_openai
```

## 🚀 Lancement

| Commande           | Description                          |
|--------------------|--------------------------------------|
| `npm run dev`      | Démarrer Vite (frontend seul)        |
| `npm run dev:netlify` | Démarrer avec Netlify Dev (frontend + fonctions) |
| `npm run build`    | Build de production                  |
| `npm run preview`  | Prévisualiser le build               |

> **Important :** utilisez `npm run dev:netlify` pour tester les analyses, car elles passent par les Netlify Functions.

## 📂 Format CSV (Dashboard clients)

En-têtes attendus (sensibles à la casse) :

```csv
id,full_name,city,shipment_type,last_order_date,comment
1,Amine Benali,Algiers,Express,2026-02-12,service mli7 w waslat b sr3a
2,Sarah Mekki,Oran,Standard,2026-01-28,taakhrat chwiya bsah
```

Équivalents acceptés : `nom` / `ville` / `type` / `date` / `commentaire`.

## 🌐 Routes

| Route      | Page                          |
|------------|-------------------------------|
| `/`        | Accueil                       |
| `/analyze` | Analyse IHL (texte unique)    |
| `/clients` | Dashboard clients (batch)     |
| `/about`   | À propos                      |

## 📄 Licence

Projet privé.
