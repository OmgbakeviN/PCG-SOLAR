# PCG SOLAR — Project Context

## 1. Projet
PCG SOLAR est un site vitrine et catalogue pour une entreprise active dans les panneaux solaires et les énergies renouvelables au Cameroun.

## 2. Direction visuelle validée
- Plus d'images humaines / scènes terrain.
- Moins de cartes arrondies et moins d'esthétique SaaS.
- Grilles éditoriales, séparateurs, grandes images, typographie forte.
- Palette : bleu nuit, bleu électrique, orange solaire, blanc.
- Références d'inspiration : UpOwa pour la logique commerciale/catalogue et Anthem pour la narration corporate/énergie.
- Le résultat doit rester une identité propre à PCG SOLAR.

## 3. Stack actuelle
- React 18
- Vite
- Tailwind CSS
- React Router
- Lucide React

## 4. État fonctionnel — V0.3
### Site public
- Homepage complète.
- Présentation de produits en vedette directement sur la homepage.
- Page `/boutique` avec recherche et filtre par catégorie.
- Page de détail `/boutique/:slug`.
- Navigation publique mise à jour vers la boutique.

### Administration
- Login prototype `/admin/login`.
- Dashboard `/admin`.
- Gestion catalogue `/admin/produits`.
- Ajout `/admin/produits/nouveau`.
- Modification `/admin/produits/:id/modifier`.
- Publication / masquage.
- Mise en vedette homepage.
- Suppression.
- Les changements sont immédiatement visibles sur la homepage et dans la boutique.

## 5. Persistance actuelle
La V0.3 utilise `localStorage` uniquement pour rendre le prototype React entièrement testable sans backend.

IMPORTANT : ce mécanisme n'est pas destiné à la production. Les données sont liées au navigateur courant et l'authentification frontend n'est pas sécurisée.

## 6. Architecture production prévue
Comme le frontend reste en React/Vite, PostgreSQL ne doit pas être exposé directement au navigateur. Il faudra ajouter une API backend :

React/Vite -> API backend -> PostgreSQL

Le backend pourra être réalisé lors de la prochaine phase. L'interface admin et le modèle de données sont préparés pour remplacer le stockage local par des appels API sans refaire le design.

## 7. Modèle produit actuel
- id
- slug
- name
- category
- shortDescription
- description
- image
- price
- power
- brand
- warranty
- availability
- featured
- published

## 8. Auth prototype
Les identifiants sont volontairement de démonstration et préremplis dans l'écran de connexion. Ils doivent disparaître au moment de connecter l'authentification serveur.

## 9. Images produits
Des illustrations SVG PCG SOLAR sont fournies dans `public/products/`. Elles évitent les liens externes fragiles pendant le développement. Elles pourront être remplacées par les vraies photos produit depuis l'admin lorsque l'upload backend sera disponible.

## Direction validée — v0.4.0

Suite au feedback management, la homepage doit rester beaucoup plus simple et immédiatement lisible, avec UpOwa comme référence de sobriété structurelle. Éviter l'accumulation de sections, de cartes et d'effets visuels. La police principale du site est désormais Outfit. Les produits disposent d'aperçus en modal avec une barre d'actions en bas. L'administration gère maintenant les catégories du catalogue ; ces catégories alimentent les formulaires produit et les filtres de la boutique.

## Ajustement UI — v0.4.1

La fiche produit publique doit être présentée en **modal**, y compris lorsqu'un utilisateur utilise l'URL `/boutique/:slug`. Il ne faut plus afficher une longue page produit dédiée. Les principaux boutons d'action doivent rester regroupés dans le pied de la modal. La typographie principale du projet est désormais **Outfit**, appliquée globalement au site public et à l'administration.

## Backend Neon — v0.4.2

Le backend public est maintenant opérationnel sur Neon Functions avec PostgreSQL. Les endpoints publics validés sont `/health`, `/categories`, `/products` et `/products/:slug`.

Le catalogue public React ne dépend plus de `localStorage` : `PublicLayout` fournit un `CatalogContext` qui charge les produits et catégories via `VITE_API_URL`. L'administration conserve temporairement l'ancien `ProductContext` local afin de séparer proprement la migration publique de la future migration CRUD sécurisée.

Prochaine étape backend : configurer Managed Better Auth pour l'administrateur, puis ajouter les routes protégées de création, modification et suppression des produits/catégories. Ensuite, relier l'upload produit à Neon Object Storage.

## Authentification admin — v0.4.3

L'ancien login de démonstration n'est plus utilisé par les écrans admin. L'identité est désormais gérée par **Managed Neon Auth (Better Auth)** via `@neondatabase/auth`.

Variables frontend :
- `VITE_NEON_AUTH_URL` : endpoint public Neon Auth de la branche active.
- `VITE_ENABLE_ADMIN_SETUP` : drapeau temporaire servant uniquement à exposer `/admin/setup` pendant la création du premier administrateur.

Le frontend sait maintenant créer une session, lire la session courante et se déconnecter via Neon Auth. La table `public.admin_users` reste la source d'autorisation métier PCG SOLAR. La prochaine étape doit valider le JWT dans Neon Functions puis vérifier `admin_users` avant tout POST/PUT/DELETE. Tant que cette vérification backend n'est pas ajoutée, l'authentification frontend ne doit pas être considérée comme la protection finale des opérations CRUD.

### Backend authorization — V4.4
L'accès à `/admin` ne repose plus uniquement sur la session visible côté React. Le navigateur récupère un JWT court depuis Neon Auth puis appelle `GET /admin/me` sur la Neon Function. La Function vérifie la signature via `NEON_AUTH_JWKS_URL`, contrôle l'issuer dérivé de `NEON_AUTH_BASE_URL`, puis vérifie que `payload.sub` correspond à un enregistrement actif dans `public.admin_users`. Seuls les comptes satisfaisant ces deux contrôles sont reconnus comme administrateurs PCG SOLAR.

## V4.5 — Sources de données et CRUD réels

- Frontend : React / Vite / Tailwind sur Vercel ; police **Outfit** ; homepage sobre, boutique et détail en modal.
- Backend : Neon Functions / Hono / PostgreSQL (`development` pendant les tests). `VITE_API_URL` pointe vers la Function de la branche courante ; `VITE_NEON_AUTH_URL` vers Neon Auth de la **même branche**.
- `ProductContext` admin appelle désormais `GET /admin/products` et `GET /admin/categories`, puis effectue toutes ses opérations CRUD avec des requêtes authentifiées ; aucune copie produits/catégories n'est conservée en `localStorage`.
- La Function réutilise `requireAdmin()` sur chaque route /admin sensible : vérification JWKS / issuer / `sub`, puis vérification `admin_users.is_active`.
- `GET /products` et `GET /categories` demeurent publics et filtrent les contenus publiés/visibles. Une catégorie masquée retire ses produits du catalogue public sans les effacer de l'admin.
- Les identifiants SQL produits/catégories sont numériques ; le frontend les convertit en chaînes uniquement pour les comparaisons React/Router.
- Valeurs prix : `NUMERIC(14,2)` FCFA en base ; chaîne de montant dans le formulaire ; NULL = « Sur devis ». `availability` en base : `available`, `out_of_stock`, `on_order`.
- Ne pas réintroduire de login local, de `localStorage` pour le catalogue, de données fictives admin, ni d'upload d'image simulé. Les images réelles via Neon Object Storage sont la prochaine étape.
- Diffuser chaque itération sous forme de ZIP contenant **uniquement les nouveaux fichiers ou fichiers modifiés** à leurs chemins exacts depuis la racine.

## V4.6 — Photos réelles Neon Object Storage
- **Architecture validée** : React/Vite sur Vercel, Neon Function sécurisée côté serveur, PostgreSQL, Neon Auth, Object Storage.
- Les images vont dans le bucket `product-images` (`public_read` pour que les navigateurs puissent les afficher sans jeton). Seule la Function les écrit et les supprime après vérification JWT + `public.admin_users`.
- Les tables `product_images` et `products.main_image_key` sont utilisées ; `main_image_key` devient la référence principale, tandis que `product_images` conserve les 8 photos maximum, position et texte alternatif.
- L'admin peut charger JPEG/PNG/WebP (5 Mo chacun), définir la principale, en supprimer et regarder la galerie. Les produits sans photo continuent d'afficher les SVG de démonstration.
- La modal produit publique affiche des miniatures de galerie si plusieurs photos existent ; ses boutons d'action restent en bas.
- La config de la branche Neon (`neon.ts`) est possédée par le workspace de l'utilisateur, non écrasée par les patchs ZIP ; le bucket doit être ajouté à la config existante ou provisionné dans Neon Console.
- Ne **jamais** placer `AWS_SECRET_ACCESS_KEY`, `AWS_ACCESS_KEY_ID` ou `DATABASE_URL` dans un fichier `VITE_*`. La Function reçoit ses credentials de Neon.
- Pour installer le backend, exécuter `npm install aws4fetch` dans le vrai projet. Le ZIP ne remplace pas `package.json`, car ce dernier peut contenir des dépendances installées localement depuis les patchs précédents.

## V4.8 — Homepage direction Frontend Design (2026-10-15)
- Méthode : Anthropic `frontend-design` via skills.sh. Conception intentionnelle avec une identité propre à PCG SOLAR.
- Nouvelle homepage volontairement courte : hero photo terrain → à propos + humain → 3 produits Neon en vedette → prise de contact.
- Titres de la homepage : `Barlow Condensed` ; police globale et admin : `Outfit` conservée.
- Ne pas recréer de cards uniformes arrondies ou de sections génériques supplémentaires dans la homepage.
- Les aperçus de produits ouvrent toujours `ProductQuickViewModal` et ses actions en bas ; les données passent toujours par `CatalogContext`/Neon.
- `HomeMission.jsx` et `HomeValues.jsx` ne sont plus montés dans la homepage, mais restent dans le code sans changement.
- Aucune modification des URLs/backend/sécurité ; ne pas placer de credentials dans les fichiers publics.
- Photos Pexels dans `siteData.js` : remplaçables ultérieurement par des clichés de PCG SOLAR.
- Documentation de design détaillée : `docs/HOMEPAGE_DESIGN_V4_8.md`.
