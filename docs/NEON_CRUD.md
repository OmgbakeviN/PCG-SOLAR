# PCG SOLAR — Guide de vérification CRUD V4.5

## Préparation

1. Vérifier `neon status` : branche `development` (pas `production`).
2. Vérifier la correspondance des branches entre API (`VITE_API_URL`) et Auth (`VITE_NEON_AUTH_URL`).
3. Installer les dépendances si nécessaire : `npm install`, et pour la Neon Function, `npm install hono pg jose @neon/config` si elles ne figurent pas déjà dans ton `package.json` local.
4. Déployer le fichier `functions/api.ts` mis à jour avec `neon deploy`.
5. Lancer le frontend via `npm run dev`, puis se connecter à `/admin/login`.

## Routes

Publiques inchangées :
- `GET /products` : uniquement produits `published = true` de catégories actives.
- `GET /products/:slug` : détail public.
- `GET /categories` : uniquement catégories actives.

Protégées :
- `GET /admin/me` : utilisateur administrateur courant.
- `GET /admin/products` et `GET /admin/categories` : liste complète, y compris brouillons et catégories masquées.
- `POST /admin/products` ; `PATCH /admin/products/:id` ; `DELETE /admin/products/:id`.
- `POST /admin/categories` ; `PATCH /admin/categories/:id` ; `DELETE /admin/categories/:id`.

Toutes les routes `/admin` doivent recevoir un JWT valide (`Authorization: Bearer <jwt>`) et vérifier `public.admin_users.is_active = true` côté serveur. Un accès direct via Postman sans token doit retourner **401**, ou **403** pour un utilisateur valide non admin.

## Parcours manuel recommandé

1. `/admin/categories` : ajouter « Régulateurs » ; vérifier que la nouvelle ligne apparaît et persiste après F5.
2. `/admin/produits/nouveau` : créer « Régulateur 60A » dans cette catégorie, prix `45000`, statut publié et vedette ; vérifier la ligne dans `/admin/produits`, puis le catalogue public après rafraîchissement.
3. Dans la liste admin : masquer le produit ; vérifier qu'il disparaît de `/boutique` mais reste dans `/admin/produits`.
4. Re-publier et enlever « Vedette » ; vérifier sa présence dans la boutique mais pas parmi les produits mis en avant sur la homepage.
5. Modifier son nom et son prix ; vérifier après F5 et dans le détail en modal.
6. Tester la suppression de « Régulateurs » tant que le produit existe : doit renvoyer **409** ou afficher un avertissement de catégorie utilisée.
7. Supprimer ensuite le produit de test, puis la catégorie de test. Vérifier la persistance après F5.
8. Déconnexion : une requête directe vers `GET /admin/products` ou `POST /admin/products` sans JWT ne doit pas réussir.

## Important

- Aucune table ou migration SQL supplémentaire requise sur le schéma V4 déjà créé.
- Ne pas copier les `localStorage` existants dans Neon automatiquement : ils sont **abandonnés**, pas migrés.
- Photo : le champ image est provisoirement une illustration locale dépendant de la catégorie. Les véritables uploads et clés `main_image_key` viendront avec Neon Object Storage.
- `POST`/`PATCH` acceptent JSON ; le prix est une chaîne numérique (`"45000"`) ou `null`. Les catégories sont liées par leur ID PostgreSQL, pas par leur libellé.
- Si un `401` survient après la connexion : vérifier la branche Auth/API, la validité du JWT et la présence de l'utilisateur dans `admin_users`. Ne pas afficher de JWT dans une capture d'écran.
