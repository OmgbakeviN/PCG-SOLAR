# Gestion des catégories — prototype

Route : `/admin/categories`

Fonctions disponibles :
- créer une catégorie ;
- modifier son nom, son slug et sa description ;
- masquer/afficher une catégorie dans les filtres de la boutique ;
- supprimer une catégorie uniquement lorsqu'aucun produit ne l'utilise ;
- restaurer les catégories de démonstration.

Dans cette version frontend, les catégories sont enregistrées dans `localStorage` sous la clé `pcg-solar-categories-v1`.

Lors du branchement Django/PostgreSQL, cette logique sera remplacée par une table `Category` et des endpoints API sans changer l'interface générale.
