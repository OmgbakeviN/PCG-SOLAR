import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductQuickViewModal from '../components/ProductQuickViewModal'
import { useCatalog } from '../context/CatalogContext'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products, loading, error } = useCatalog()
  const product = products.find((item) => item.slug === slug && item.published)

  if (loading) {
    return (
      <main className="min-h-[72vh] bg-slate-50 pt-[78px]">
        <div className="container-pcg py-28 text-center">
          <p className="text-sm font-semibold text-slate-400">Chargement du produit…</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="pt-[78px]">
        <div className="container-pcg py-28 text-center">
          <h1 className="text-4xl font-extrabold text-pcg-ink">Produit introuvable</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            {error || "Ce produit n'est pas disponible ou n'est plus publié dans le catalogue."}
          </p>
          <Link to="/boutique" className="btn-primary mt-8">Retour à la boutique</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[72vh] bg-slate-50 pt-[78px]">
      <div className="container-pcg py-24">
        <p className="text-sm font-semibold text-slate-400">Catalogue PCG SOLAR</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] text-pcg-ink sm:text-4xl">
          Détail du produit
        </h1>
      </div>

      <ProductQuickViewModal
        product={product}
        onClose={() => navigate('/boutique')}
        detailMode
      />
    </main>
  )
}
