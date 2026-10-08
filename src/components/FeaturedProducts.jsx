import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import ProductCard from './ProductCard'
import ProductQuickViewModal from './ProductQuickViewModal'

export default function FeaturedProducts() {
  const { products, loading, error } = useCatalog()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const featured = products.filter((product) => product.published && product.featured).slice(0, 4)

  if (loading) {
    return (
      <section id="produits-en-vedette" className="bg-white py-20 sm:py-24">
        <div className="container-pcg">
          <span className="eyebrow">Nos produits</span>
          <p className="mt-5 text-sm font-semibold text-slate-400">Chargement du catalogue…</p>
        </div>
      </section>
    )
  }

  if (error || !featured.length) return null

  return (
    <section id="produits-en-vedette" className="bg-white py-20 sm:py-24">
      <div className="container-pcg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Nos produits</span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.035em] text-pcg-ink sm:text-4xl">Des équipements pour votre installation solaire.</h2>
          </div>
          <Link to="/boutique" className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-pcg-blue hover:text-pcg-ink">
            Tous les produits <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
          ))}
        </div>
      </div>

      <ProductQuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}
