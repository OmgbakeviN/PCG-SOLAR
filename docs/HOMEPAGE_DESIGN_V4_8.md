# PCG SOLAR — Direction visuelle de la page d'accueil (V4.8)

**Source de méthode :** https://www.skills.sh/anthropics/skills/frontend-design (Anthropic / frontend-design).

## Objectif

Une homepage commerciale **plus simple**, avec des personnes et des équipements réels. En quelques secondes, le visiteur doit comprendre :
1. ce que propose PCG SOLAR ;
2. où consulter les produits disponibles ;
3. comment contacter l'entreprise pour un projet solaire.

## Décision de direction (après revue anti-template)

- **Angle :** « le solaire, pensé pour la vraie vie » ; une énergie utile aux foyers et aux activités quotidiennes, pas un discours technologique abstrait.
- **Palette :** bleu nuit `#061E34`, bleu fonctionnel `#086DA9`, orange du logo `#FFAD1F`, blanc `#FFFFFF`, gris clair `#F2F5F7`, texte secondaire `#5A6A76`.
- **Typographie :** `Barlow Condensed` pour les grands titres expressifs de la homepage ; `Outfit` pour les textes courants et le reste du site (pas de changement global de l'admin/boutique).
- **Mise en page :** une grande image humaine dans le hero ; bloc texte à gauche sur overlay contrasté ; éditorial 2 colonnes pour la présentation ; produits en grille ouverte sans cards arrondies ; CTA final texte + photo.
- **Interactivité :** boutons et modale produits uniquement sur intention utilisateur. Pas d'animations automatiques omniprésentes.
- **Accessibilité :** liens explicites, `aria-labelledby`, focus visible, responsive mobile, respect de `prefers-reduced-motion`.

## Sections de la homepage

1. **Hero** — proposition de valeur, lien boutique, lien contact, photo terrain.
2. **À propos** — présentation courte, photo équipe, inventaire simple des familles d'équipements.
3. **Sélection produits** — jusqu'à 3 produits `featured`/`published` depuis Neon, galerie publique, aperçus en modal existante, lien boutique.
4. **Contact** — appel à parler du besoin et CTA mail / boutique, photo de professionnel.

Le menu et le pied de page existants restent conservés.

## Hors périmètre

- Aucune modification de `functions/`, `src/services/`, de Neon Auth, de PostgreSQL, du panier (non prévu), de la boutique ni de l'admin.
- Pas de faux chiffres, faux avis clients, prix inventés, certificats ou réalisations fictives.
- Les images de présentation existantes (`src/data/siteData.js`) restent des visuels de maquette hébergés chez Pexels. Les remplacer par des photos de l'équipe et des installations PCG SOLAR avant validation finale.
- `contact@pcgsolar.com` est l'adresse de contact héritée du site précédent ; vérifier qu'elle est réellement utilisée par l'entreprise.

## Fichiers de cette itération

- `src/pages/HomePage.jsx`
- `src/components/Hero.jsx`
- `src/components/HomeAbout.jsx`
- `src/components/FeaturedProducts.jsx`
- `src/components/ContactCTA.jsx`
- `src/index.css` (styles nouveaux, strictement scopés sous `.pcg-home`)
- `index.html` (chargement de `Barlow Condensed` en plus d'Outfit)
- `docs/HOMEPAGE_DESIGN_V4_8.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/CHANGELOG.md`

## Vérification lors de l'intégration

1. `npm run build` dans le vrai workspace.
2. Tester à 375 px, 768 px, 1440 px et au clavier (Tab/Entrée/Échap).
3. Vérifier la présence du header sur photo et le menu mobile.
4. Tester `/boutique`, bouton « Détails » (modal), barre d'actions en bas, fermeture de modale.
5. Vérifier le cas où aucun produit n'est en vedette et l'erreur réseau de l'API.
6. Vérifier les photos à partir d'une connexion normale, car ce sont toujours des URLs distantes de démonstration.
