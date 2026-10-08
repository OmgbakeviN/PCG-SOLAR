# PCG SOLAR — React + Tailwind

Version 0.4 : homepage simplifiée + boutique + modales produits + administration catalogue et catégories.

## Installation
```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:5173`.

## Routes utiles
- `/` — accueil simplifié
- `/boutique` — catalogue public
- `/admin/login` — connexion administration
- `/admin` — dashboard
- `/admin/produits` — gestion des produits et aperçu modal
- `/admin/produits/nouveau` — ajout d'un produit
- `/admin/categories` — gestion des catégories

## Login admin prototype
Les identifiants de démonstration sont préremplis sur `/admin/login`.

> Cette authentification est uniquement destinée au prototype local. Elle sera remplacée par une authentification serveur sécurisée avec Django/PostgreSQL.

## Données
Pour l'instant, produits et catégories sont sauvegardés dans `localStorage`. Cela permet de tester immédiatement le flux complet :

1. créer ou modifier une catégorie ;
2. l'utiliser dans un produit ;
3. publier le produit ;
4. le retrouver dans la boutique et, s'il est en vedette, sur la homepage.

Voir `docs/PROJECT_CONTEXT.md`, `docs/CATEGORIES.md` et `docs/API_CONTRACT_DRAFT.md` pour la suite.

### Mise à jour v0.4.1
- Fiche produit affichée en modal sur `/boutique/:slug`.
- Police globale remplacée par **Outfit**.
