import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import ProductQuickViewModal from '../components/ProductQuickViewModal'
import { useCatalog } from '../context/CatalogContext'
import { media } from '../data/siteData'

export default function ShopPage() {
  const { products, categories, loading, error, refreshCatalog } = useCatalog()
  const [category, setCategory] = useState('Tous')
  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const categoryNames = ['Tous', ...categories.filter((item) => item.active).map((item) => item.name)]

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.published) return false
      const categoryMatch = category === 'Tous' || product.category === category
      const searchMatch = `${product.name} ${product.category} ${product.shortDescription}`
        .toLowerCase()
        .includes(query.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [products, category, query])

  return (
    <main className="pt-[78px]">
      <section className="relative overflow-hidden bg-pcg-ink text-white">
        <div className="absolute inset-0">
          <img src={media.engineer} alt="Ingénieur solaire" className="h-full w-full object-cover object-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071b33] via-[#071b33]/90 to-[#071b33]/30" />
        </div>
        <div className="container-pcg relative py-20 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pcg-solar">Boutique PCG SOLAR</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
            Nos équipements solaires.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Panneaux, batteries, onduleurs et kits pour construire une installation adaptée à vos besoins.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="container-pcg">
          {error ? (
            <div className="border-y border-red-200 bg-red-50 py-12 text-center">
              <p className="text-lg font-extrabold text-red-700">Le catalogue est momentanément indisponible.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-red-600/80">{error}</p>
              <button type="button" onClick={refreshCatalog} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-red-700 hover:text-red-900">
                <RefreshCw size={16} /> Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 border-b border-slate-200 pb-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex flex-wrap gap-x-7 gap-y-3">
                  {categoryNames.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`border-b-2 pb-2 text-sm font-bold transition ${
                        category === item
                          ? 'border-pcg-solar text-pcg-ink'
                          : 'border-transparent text-slate-500 hover:text-pcg-ink'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <label className="flex min-w-0 items-center gap-3 border border-slate-200 bg-white px-4 py-3 lg:w-[320px]">
                  <Search size={18} className="text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un produit"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
                <p>
                  {loading ? (
                    'Chargement du catalogue…'
                  ) : (
                    <><strong className="text-pcg-ink">{visibleProducts.length}</strong> produit(s)</>
                  )}
                </p>
                <span className="hidden items-center gap-2 sm:inline-flex"><SlidersHorizontal size={16} /> Catalogue public</span>
              </div>

              {!loading && visibleProducts.length ? (
                <div className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
                  ))}
                </div>
              ) : !loading ? (
                <div className="border-y border-slate-200 py-20 text-center">
                  <p className="text-xl font-extrabold text-pcg-ink">Aucun produit ne correspond à cette recherche.</p>
                  <p className="mt-2 text-sm text-slate-500">Essayez une autre catégorie ou un autre mot-clé.</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <ProductQuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  )
}
