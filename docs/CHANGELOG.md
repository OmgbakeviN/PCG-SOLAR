# Changelog — PCG SOLAR

## V4.4.3 — JWT de session : compatibilité Neon Managed Auth

- Correction du cas « `email` 200 + `get-session` 200, mais aucune requête `/admin/me` ».
- Élimination de la dépendance obligatoire à `authClient.token()` (absent dans certaines versions du SDK React).
- Lecture du JWT court directement dans la session quand il est fourni (`access_token` ou `token` au format JWT).
- Sinon, demande du JWT au endpoint Better Auth officiel `GET /token` avec le cookie HTTP-only, sans exposer de secret PostgreSQL.
- Refus explicite d'utiliser le jeton de session opaque comme JWT.
- Messages dédiés pour les réponses `/token` 401/404, session absente, ou absence de JWT.
- Aucun changement backend nécessaire pour ce patch : conserver les contrôles JWKS + `admin_users` dans la Function.


## V4.4.2 — Correction récupération JWT Neon Auth

- Suppression de l'appel à `authClient.getJWTToken()` qui déclenchait une requête vers l'ancien endpoint `/get-jwt-token` et retournait `404 Not Found` avec Managed Better Auth.
- Utilisation exclusive de `authClient.token()` pour récupérer le JWT court destiné aux appels vers Neon Functions.
- Conservation de l'envoi du JWT via `Authorization: Bearer <token>` vers `/admin/me`.
- Ajout de messages d'erreur plus explicites si le SDK Neon Auth installé est trop ancien ou si aucun JWT n'est retourné.

## V4.4.1 — Correction boucle de redirection Admin

- Suppression de la boucle `/admin` ↔ `/admin/login` lorsque la session Neon Auth existe mais que `/admin/me` retourne `401`.
- Ajout d’un écran de resynchronisation avec déconnexion/reconnexion explicite au lieu d’une redirection automatique infinie.
- Récupération du JWT rendue compatible avec `getJWTToken()` et, en fallback, `token()`.
- Activation des future flags React Router v7 pour supprimer les avertissements `v7_startTransition` et `v7_relativeSplatPath`.

## 0.3.0 — Boutique + administration catalogue
- Ajout de React Router.
- Transformation du projet en application multi-pages côté client.
- Ajout de la page Boutique `/boutique`.
- Ajout de la page détail produit `/boutique/:slug`.
- Ajout de produits en vedette sur la homepage.
- Ajout de 8 produits de démonstration.
- Ajout d'illustrations produit locales dans `public/products/`.
- Ajout de l'espace admin.
- Login admin prototype.
- Dashboard admin.
- Liste, création, modification et suppression de produits.
- Publication / masquage d'un produit.
- Sélection des produits à mettre en vedette sur la homepage.
- Stockage temporaire dans `localStorage`.
- Mise à jour de la navigation et du footer.
- Documentation de la séparation frontend / futur backend PostgreSQL.

## 0.2.0 — Direction éditoriale
- Homepage revue avec davantage d'humains et de scènes terrain.
- Réduction importante des cartes arrondies.
- Sections plus éditoriales et corporate.

## 0.1.0 — Base du site
- Première homepage PCG SOLAR.
- Identité bleu / orange / blanc.
- Documentation initiale du projet.

## v0.4.0 — Homepage simplifiée, modales produit & catégories

- Simplification complète de la page d'accueil dans une logique plus proche du rythme éditorial d'UpOwa : hero, présentation, produits, mission, avantages, contact.
- Suppression de la homepage des sections qui surchargeaient la lecture (processus, projets, blocs intermédiaires multiples).
- Nouvelle police principale : **Sora**.
- Ajout d'un aperçu produit en modal sur la homepage et dans la boutique, avec actions placées en pied de modal.
- Ajout d'un aperçu produit en modal dans l'administration, avec actions Voir / Modifier / Supprimer en bas.
- Ajout de `/admin/categories` pour créer, modifier, afficher/masquer et supprimer les catégories inutilisées.
- Les formulaires produit et filtres de boutique utilisent désormais les catégories gérées depuis l'administration.
- Les catégories restent stockées en localStorage pour le prototype, en attendant Django/PostgreSQL.

## v0.4.1 — Détail produit en modal & nouvelle typographie

- La route `/boutique/:slug` n'affiche plus une page produit classique : elle ouvre maintenant le détail dans une vraie modal.
- Le bouton **Détails** des produits conserve une URL partageable tout en présentant le produit dans une modal.
- La modal produit est enrichie avec image, description, puissance/capacité, disponibilité, marque, prix, garantie et catégorie.
- Les actions sont désormais fixées en bas de la modal : **Fermer**, **WhatsApp** et **Demander un devis**.
- La modal peut être fermée avec le bouton X, un clic sur l'arrière-plan ou la touche Échap.
- Remplacement de la police **Sora** par **Outfit** sur l'ensemble du site et de l'administration.

## v0.4.2 — Catalogue public connecté à Neon

- Ajout de `src/services/api.js` pour centraliser les appels au backend Neon Functions.
- Ajout d'un `CatalogContext` dédié au site public afin de ne pas casser l'administration prototype encore basée sur `localStorage`.
- La homepage, la boutique et la modal détail lisent désormais les produits et catégories depuis Neon PostgreSQL via l'API.
- Ajout des états de chargement et d'erreur du catalogue public.
- Normalisation des données PostgreSQL vers le format attendu par les composants React existants.
- Les images restent temporairement des visuels locaux de secours tant que Neon Object Storage n'est pas relié au catalogue.
- L'administration reste volontairement en mode prototype local jusqu'à l'intégration de Neon Auth et des routes CRUD sécurisées.

## v0.4.3 — Neon Auth pour l'administration

- Remplacement du faux login `localStorage` par Managed Neon Auth / Better Auth.
- Ajout de `src/services/auth.js` avec le client `@neondatabase/auth` et l'adapter React.
- `/admin/login` utilise désormais `signIn.email()` et une vraie session Neon Auth.
- `ProtectedAdminRoute` s'appuie sur `useSession()` au lieu du stockage local.
- La déconnexion admin utilise désormais `authClient.signOut()`.
- L'identité du compte connecté est affichée dans la sidebar de l'administration.
- Ajout temporaire de `/admin/setup`, activable uniquement avec `VITE_ENABLE_ADMIN_SETUP=true`, pour créer le premier compte Neon Auth.
- Après le signup initial, la session est volontairement fermée jusqu'à l'ajout du compte dans `public.admin_users`.
- La vérification serveur de `admin_users` sera appliquée dans la prochaine étape lors de la sécurisation des routes CRUD Neon Functions.

## V4.4 — Neon Auth backend authorization
- Ajout de la vérification des JWT Neon Auth dans `functions/api.ts` avec `jose` et le JWKS injecté par Neon.
- Ajout de `GET /admin/me`, protégé côté Neon Function.
- Vérification serveur de la table `admin_users` et de `is_active` avant de reconnaître un administrateur.
- Le frontend récupère désormais un JWT court avec `authClient.token()` et l'envoie en `Authorization: Bearer ...`.
- `ProtectedAdminRoute` vérifie maintenant à la fois la session Neon Auth et l'autorisation serveur PCG SOLAR.
- Distinction explicite : 401 = session/token invalide, 403 = utilisateur authentifié mais non administrateur.
- Les routes publiques produits/catégories restent ouvertes. Les CRUD seront sécurisés dans l'étape suivante.

## V4.5 — CRUD admin Neon PostgreSQL

- Ajout des routes sécurisées `GET/POST /admin/products`, `PATCH/DELETE /admin/products/:id`, `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/:id` dans `functions/api.ts`.
- Toutes les routes d'administration exigent un JWT Neon Auth signé et une entrée active dans `public.admin_users`, côté Function.
- Vérification des entrées, noms de colonnes en liste blanche, paramètres SQL liés (protection contre l'injection SQL), erreurs `400`, `401`, `403`, `404`, `409`.
- Admin React : lecture des produits (publiés et brouillons) et catégories (actives ou non) depuis Neon ; ajout, modification, suppression, publication, mise en vedette et visibilité catégorie réellement persistés en PostgreSQL.
- Abandon du `localStorage` et des boutons de réinitialisation des données de démonstration pour le catalogue admin.
- Gestion du chargement, de l'échec réseau et de l'enregistrement dans les formulaires existants. Design, typographie Outfit et modales conservés.
- Les prix de l'admin sont saisis en **FCFA numérique** (champ vide = « Sur devis »). Les photos utilisent encore les illustrations locales par catégorie : la gestion d'upload via Neon Object Storage reste à faire.
- Aucun changement de schéma SQL nécessaire : migration compatible avec les tables déjà créées `categories`, `products` et `product_images`.
- QA locale : 7 fichiers syntaxiquement valides ; 8 contrôles backend simulés réussis. Compilation Vite complète non exécutée, car `npm install` a expiré dans l'environnement de génération.

## V4.6 — Images produits avec Neon Object Storage (2026-10-08)
- Ajout d'un adaptateur stockage serveur `functions/storage.ts` (S3 SigV4, `aws4fetch`, variables Neon injectées) ; aucun secret dans Vite.
- Routes JWT + admin_users : `GET/POST /admin/products/:id/images`, `PATCH /admin/products/:id/images/:imageId/main`, `DELETE /admin/products/:id/images/:imageId`.
- Images validées serveur par type MIME + signature binaire, 5 Mo max / photo, 8 max / produit ; clés uniques UUID, noms de fichiers non réutilisés.
- `main_image_key` et `product_images` synchronisés ; URLs publiques construites côté Neon Function pour un bucket `product-images` en `public_read`.
- Les API publiques et admin renvoient `main_image_url` et `images[]`. La boutique, l'accueil et les modales publiques utilisent les photos réelles, avec SVG local de secours.
- Formulaire admin : choix de plusieurs fichiers avant enregistrement, upload après création du produit, aperçu, définir photo principale et suppression ; retry sans duplication de produit si l'upload échoue.
- Aucun nouveau script SQL : les tables `products` et `product_images` ont été créées précédemment.
- Configurer manuellement le bucket `product-images` sur la branche `development` avant test. Voir `docs/IMAGE_STORAGE.md`.

## V4.7 — Préparation déploiement Vercel (2026-10-08)
- Ajout de `vercel.json` avec rewrite SPA pour React Router (`/boutique`, `/admin`, modales avec URL partageable).
- Renforcement de `.gitignore` pour les configurations locales Vercel/Neon.
- Ajout de `docs/DEPLOYMENT_VERCEL.md` : GitHub, Vercel, environnements, Auth, validation backend production, recette et sécurité.
- Aucun changement aux composants React, au schéma PostgreSQL ou au backend Neon.

## V4.8 — Redesign homepage selon frontend-design (2026-10-15)
- Référence de méthode étudiée : https://www.skills.sh/anthropics/skills/frontend-design.
- Redesign exclusif de la page d'accueil : hero photographique plus assumé, présentation éditoriale très courte, sélection produits et CTA final. Suppression de deux sections répétitives sur l'accueil (mission et valeurs), sans supprimer leurs anciens composants.
- Barlow Condensed sur les grands titres de la homepage ; Outfit conservée pour le corps du site, la boutique et l'administration.
- Palette fidèle au logo PCG SOLAR ; pas de chiffres ni références client fictifs, pas de multiplication de cards arrondies.
- Sélection produits réellement issue de Neon via `useCatalog()` ; accès à la modal produit existante ; chargement, absence de produits vedettes et erreur réseau traités.
- Nouveau CSS uniquement sous `.pcg-home` pour ne pas changer les pages existantes.
- Aucune modification backend, Auth, stockage, API, fichier de secrets ou configuration Vercel.
- Détail de la direction visuelle : `docs/HOMEPAGE_DESIGN_V4_8.md`.
