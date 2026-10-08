# Brouillon API — Catalogue PCG SOLAR

Ce contrat prépare le remplacement du `localStorage` par PostgreSQL.

## Produits
- `GET /api/products` — liste publique/admin selon droits.
- `GET /api/products/:slug` — détail public.
- `POST /api/admin/products` — créer.
- `PATCH /api/admin/products/:id` — modifier.
- `DELETE /api/admin/products/:id` — supprimer.

## Auth admin
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`

## Données produit
```json
{
  "name": "Panneau monocristallin 550W",
  "slug": "panneau-monocristallin-550w",
  "category": "Panneaux solaires",
  "shortDescription": "...",
  "description": "...",
  "image": "/media/products/...",
  "price": "Sur devis",
  "power": "550 W",
  "brand": "PCG Selection",
  "warranty": "...",
  "availability": "Disponible",
  "featured": true,
  "published": true
}
```
