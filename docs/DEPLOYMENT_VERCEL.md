# PCG SOLAR — V4.7 : déploiement Vercel / Neon

## Architecture
- Frontend **React + Vite** hébergé sur Vercel. Le projet n'est pas Next.js.
- Backend **Neon Functions**, base **Neon PostgreSQL**, **Managed Better Auth**, **Neon Object Storage**.
- Les bases, comptes Auth, buckets, objets et Functions sont *propres à chaque branche Neon*. `development` n'est **pas** automatiquement synchronisée avec `production`.

## 1. Préparation locale
1. Extraire le patch à la racine. Vérifier `vercel.json`.
2. Vérifier `npm install` et `npm run build` (sortie : `dist/`).
3. Vérifier que `.gitignore` couvre `.env*`, `.neon/`, `.vercel/`, `dist/` et `node_modules/`.
4. Ne **jamais** commiter `.env.local`, `DATABASE_URL`, `AWS_SECRET_ACCESS_KEY`, tokens et clés JWT.

## 2. Vérifier Neon PRODUCTION avant l'ouverture au public
- Ouvrir Neon > projet `pcg-solar` > branche **production**.
- Dans SQL Editor, vérifier que `categories`, `products`, `product_images` existent et que le schéma correspond au backend actuellement déployé.
- Vérifier que Neon Auth est activé sur **production** (son endpoint est différent de celui de `development`).
- Vérifier `public.admin_users`. Si absent, à condition que `neon_auth."user".id` ait bien le type `uuid`, créer :

```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- Vérifier bucket `product-images` de type **public_read** sur cette branche ; ne jamais rendre public un bucket destiné à des fichiers confidentiels.
- Avec le CLI, sélectionner la branche de production puis vérifier le plan avant de déployer la Function (depuis la racine, avec le `neon.ts` déjà présent) :

```bash
neon checkout production
neon status
neon config plan
neon deploy
```

Ne pas accepter un plan qui supprime des services existants. Vérifier ensuite `GET /health`, `/products`, `/categories` de **l'URL de la Function production**. Conserver l'URL de la Function et l'URL Auth production. Revenir ensuite sur `development` pour le travail habituel et rétablir tes variables `.env.local` de développement si elles ont changé.

### Premier admin de production
Les utilisateurs et leurs mots de passe de `development` ne sont pas nécessairement présents sur `production`. Créer un utilisateur propre à la branche production via les moyens officiels Neon Auth puis insérer **son ID** dans `public.admin_users` sur production. Si tu utilises temporairement la page `/admin/setup` depuis localhost, configure l'URL Auth production en local et autorise localhost uniquement le temps de l'initialisation, puis désactive à nouveau. **Ne publie jamais VITE_ENABLE_ADMIN_SETUP=true**. Vérifier ensuite `/admin/me` avec le JWT du compte production.

## 3. Envoyer le frontend vers GitHub
Créer un dépôt GitHub vide, puis depuis la racine du projet (si ce n'est pas encore un dépôt Git) :

```bash
git init
git add .
git commit -m "Deploy PCG SOLAR frontend on Vercel"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/pcg-solar.git
git push -u origin main
```

Si le projet est *déjà* relié à GitHub, ne pas refaire `git init` ou ajouter un second `origin` ; utiliser le flux `git add`, `git commit`, `git push` habituel.

## 4. Importer sur Vercel
- Ouvrir https://vercel.com/new > **Add New > Project**, puis **Import** le dépôt GitHub.
- Framework Preset : **Vite**.
- Root Directory : **./** (sauf si tu as changé de structure).
- Build Command : `npm run build`.
- Output Directory : `dist`.
- Install Command : `npm install` (automatique par défaut).

### Environment Variables de Vercel
Dans Project > Settings > Environment Variables, configurer AVANT le déploiement :

```dotenv
VITE_API_URL=https://TON-API-NEON-PRODUCTION
VITE_NEON_AUTH_URL=https://TON-ENDPOINT-AUTH-NEON-PRODUCTION
VITE_ENABLE_ADMIN_SETUP=false
```

Ces variables `VITE_` sont **publiques au navigateur** ; seules les URLs d'API/Auth non secrètes y sont autorisées. **Ne jamais mettre** `DATABASE_URL`, `NEON_AUTH_JWKS_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` dans les variables frontend.

Pour un Preview Vercel utilisant Neon `development`, configurer ces variables séparément dans l'environnement **Preview**, avec ses URLs propres, et ajouter les domaines Preview à la liste des origines de confiance Neon Auth si nécessaire.

## 5. Autoriser le domaine Vercel dans Neon Auth
Après le premier déploiement, récupérer l'URL effective Vercel, par ex. `https://pcg-solar.vercel.app`.

Dans un terminal Neon ciblant **production** :

```bash
neon checkout production
neon neon-auth domain add https://pcg-solar.vercel.app
neon neon-auth domain list
```

Remplacer par le vrai domaine, inclure `https://`, sans slash final. Ajouter ensuite le domaine personnalisé définitif si tu en configures un. Un domaine différent utilisé pour les previews nécessite une entrée distincte (ou une intégration automatisée appropriée).

Il peut être nécessaire de redéployer Vercel si les variables VITE ont été ajoutées ou corrigées après le premier déploiement : elles sont injectées **au build**.

## 6. Tests de recette
- `/` : page d'accueil et produits vedettes
- `/boutique` : liste produits réels
- `/boutique/<slug>` : modal et lien direct
- `/admin/login` : connexion Neon Auth **production**
- `/admin` : vérification `/admin/me`, code 200
- `/admin/categories` : création et renommage test
- `/admin/produits` : création produit test, publication puis suppression
- Upload de 2 images, changement d'image principale et suppression
- Actualisation directe de `/boutique` et `/admin` : **pas de 404** (rewrite `vercel.json`)
- Dans Network, aucun appel à `localhost:5173` ou URL `development` depuis le site de production.

## 7. Points de sécurité
- `VITE_ENABLE_ADMIN_SETUP=false` en production. Éviter de distribuer des identifiants de test.
- L'API doit continuer à contrôler JWT **et** `admin_users`, côté Function.
- Les routes publiques peuvent être consultées sans compte, mais les écritures admin doivent demander un JWT.
- Restreindre à terme `cors({ origin: '*' })` à une liste de domaines approuvés pour limiter les usages cross-origin depuis d'autres sites (cela ne remplace pas la vérification JWT).
- Assurer un moyen de sauvegarde/export et un plan de retour arrière avant le lancement public.

## 8. Documentation officielle
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/git
- https://vercel.com/docs/environment-variables
- https://github.com/neondatabase/website/blob/main/content/docs/cli/neon-auth.md
- https://github.com/neondatabase/website/blob/main/content/docs/compute/functions/overview.md
