import { ArrowUpRight, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import ProductQuickViewModal from './ProductQuickViewModal'

export default function FeaturedProducts() {
  const { products, loading, error, refreshCatalog } = useCatalog()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const featured = products.filter((product) => product.published && product.featured).slice(0, 3)

  return (
    <section id="produits-en-vedette" className="pcg-home-products" aria-labelledby="pcg-featured-title">
      <div className="container-pcg">
        <div className="pcg-home-products__heading">
          <div>
            <p className="pcg-home-kicker">Le catalogue PCG SOLAR</p>
            <h2 id="pcg-featured-title" className="pcg-home-display pcg-home-section-title">
              L'essentiel pour votre installation.
            </h2>
          </div>
          <Link to="/boutique" className="pcg-home-text-link pcg-home-text-link--dark">
            Voir toute la boutique <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>

        {loading ? (
          <p role="status" className="pcg-home-products__status">Chargement de notre sélection…</p>
        ) : error ? (
          <div className="pcg-home-products__empty" role="status">
            <p>Nos produits sont momentanément indisponibles.</p>
            <button type="button" onClick={refreshCatalog} className="pcg-home-text-link pcg-home-text-link--dark">
              Réessayer <RefreshCw aria-hidden="true" size={17} />
            </button>
          </div>
        ) : featured.length ? (
          <div className="pcg-home-products__grid">
            {featured.map((product) => (
              <article key={product.id} className="pcg-home-product">
                <button
                  className="pcg-home-product__visual"
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  aria-label={`Afficher les détails de ${product.name}`}
                >
                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                  <span className="pcg-home-product__visual-action" aria-hidden="true">
                    <ArrowUpRight size={19} />
                  </span>
                </button>
                <div className="pcg-home-product__info">
                  <p className="pcg-home-product__category">{product.category}</p>
                  <h3>{product.name}</h3>
                  {product.shortDescription && <p className="pcg-home-product__description">{product.shortDescription}</p>}
                  <div className="pcg-home-product__bottom">
                    <span className="pcg-home-product__price">{product.price}</span>
                    <button className="pcg-home-product__details" type="button" onClick={() => setSelectedProduct(product)}>
                      Détails <ArrowUpRight aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pcg-home-products__empty">
            <p>La sélection de produits sera bientôt disponible.</p>
            <Link to="/boutique" className="pcg-home-text-link pcg-home-text-link--dark">
              Parcourir la boutique <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>
        )}
      </div>

      <ProductQuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}
