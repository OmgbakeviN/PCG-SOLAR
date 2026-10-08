# PCG SOLAR — V4.6 · Guide stockage des images (Neon)

## 1. Créer le bucket sur la bonne branche

1. Dans Neon Console, choisir le projet `pcg-solar` puis **la branche `development`**.
2. Ouvrir **Object storage** et créer un bucket nommé exactement **`product-images`**.
3. Choisir **Public / Public read** (lecture anonyme ; upload/suppression toujours authentifiés côté Function).
4. Ne pas le nommer `products`, `uploads` ni `product_images`. Le code serveur attend `product-images`.
5. Dans la console ou le terminal, vérifier que le bucket existe sur `development`. Le bucket privé `uploads` précédemment créé peut rester inchangé.

Si ton dépôt pilote déjà toute l'infrastructure via `neon.ts`, **ajoute** (sans remplacer les autres propriétés de `defineConfig`) cette entrée :

```ts
buckets: {
  'product-images': { access: 'public_read' },
},
```

Vérifie le résultat de `neon config plan` avant `neon deploy` : aucune ressource existante ne doit être supprimée. N'extrais pas un `neon.ts` générique qui écraserait tes Functions / Auth existants.

## 2. Installer et déployer

```bash
neon status
npm install aws4fetch
neon config plan
neon deploy
npm run dev
```

Vérifie que la branche déployée est `development` et que `VITE_API_URL` / `VITE_NEON_AUTH_URL` de `.env.local` pointent vers **cette même branche**.

Le service Neon Function doit disposer des variables serveur suivantes, automatiquement injectées par Neon avec le service Storage :

```
AWS_ENDPOINT_URL_S3
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION  # peut être un nom de cellule ; le code extrait la région depuis l'endpoint
```

Il n'est pas nécessaire d'ajouter ces variables dans le frontend ou d'envoyer les secrets à ChatGPT. En l'absence de configuration stockage, l'upload renverra une erreur explicite côté backend ; les autres API continuent à fonctionner.

## 3. Tester l'interface

1. Ouvrir `/admin/produits/nouveau`, renseigner les champs de ton produit, choisir 2 photos JPEG/PNG/WebP puis enregistrer.
2. Attendre la fin des envois. Le produit et ses photos apparaissent dans l'admin puis dans `/boutique` et sur la home si le produit est en vedette.
3. Ouvrir `/admin/produits/:id/modifier`, choisir une autre image principale, puis vérifier la boutique.
4. Supprimer une photo, vérifier la galerie et la photo principale. Si la photo principale est supprimée, la suivante devient principale ; si aucune ne reste, un SVG local apparaît.
5. Essayer un fichier `.svg` ou supérieur à 5 Mo : rejet attendu. Tenter un upload sans session : réponse 401 ; session valide non admin : 403.

## 4. Contrat API

- `GET /admin/products/:id/images` → `{ success, data: { images, main_image_key, main_image_url } }`.
- `POST /admin/products/:id/images` → `multipart/form-data` avec fichier `image`, `alt_text` optionnel ; statut 201.
- `PATCH /admin/products/:id/images/:imageId/main` → rend la photo principale.
- `DELETE /admin/products/:id/images/:imageId` → supprime la photo et met à jour la principale.
- `GET /products`, `GET /products/:slug`, `GET /admin/products` → nouveaux champs `main_image_url`, `images` (clés + URLs).

Photo jusqu'à 5 Mio, maximum 8 photos par produit. JPG, PNG et WebP uniquement. Pas d'upload avant la création d'un produit : l'interface conserve localement les fichiers choisis puis les envoie après le `POST /admin/products` réussi.

## 5. Sécurité et cas limites

- Les identifiants S3 sont injectés côté serveur : jamais de `VITE_AWS_*`.
- Les URLs sont publiques en lecture uniquement ; les objets n'acceptent pas les écritures anonymes.
- Le serveur vérifie le JWT via JWKS et la table `admin_users` avant chaque opération d'upload/mutation.
- Validation du MIME, de la signature binaire et de la taille côté Function ; fichiers nommés par UUID, non par le nom fourni par le navigateur.
- Si l'enregistrement DB échoue après transfert, l'API tente de nettoyer l'objet. Si le nettoyage de stockage échoue après une suppression DB, l'objet orphelin est journalisé pour maintenance ultérieure.
- Les images sont servies directement depuis le bucket public read ; pour une utilisation intensive, ajouter un CDN Vercel ou Cloudflare en frontal.
