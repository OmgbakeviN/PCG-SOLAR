import { Edit3, ExternalLink, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProductPreviewModal({ product, onClose, onDelete }) {
  const [preview, setPreview] = useState('')
  useEffect(() => { setPreview(product?.image || '') }, [product?.id, product?.image])
  useEffect(() => {
    if (!product) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [product, onClose])

  if (!product) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Fermer" />
      <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pcg-blue">Aperçu produit</p>
            <h2 className="mt-1 text-lg font-extrabold text-pcg-ink">{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center border border-slate-200 text-slate-500 hover:text-pcg-ink" aria-label="Fermer">
            <X size={19} />
          </button>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr]">
          <div className="bg-slate-50 p-7">
            <img src={preview || product.image} alt={product.name} className="aspect-square w-full object-contain" />
            {product.images?.length > 1 && <div className="mt-4 flex flex-wrap gap-2">{product.images.map((image) => (
              <button key={image.id} type="button" onClick={() => setPreview(image.url)} aria-label="Afficher cette photo"
                className={`h-14 w-14 border-2 p-1 ${preview === image.url ? 'border-pcg-blue' : 'border-slate-200'}`}>
                <img src={image.url} alt={image.alt_text || product.name} className="h-full w-full object-contain" />
              </button>
            ))}</div>}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs font-bold ${product.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {product.published ? 'Publié' : 'Masqué'}
              </span>
              {product.featured && <span className="bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">En vedette</span>}
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-600">{product.description}</p>

            <dl className="mt-7 grid border-y border-slate-200 sm:grid-cols-2">
              {[
                ['Catégorie', product.category],
                ['Puissance', product.power],
                ['Prix', product.price],
                ['Disponibilité', product.availability],
                ['Marque', product.brand],
                ['Garantie', product.warranty],
              ].map(([label, value], index) => (
                <div key={label} className={`py-4 ${index % 2 ? 'sm:border-l sm:border-slate-200 sm:pl-5' : 'sm:pr-5'} ${index > 1 ? 'border-t border-slate-200' : ''}`}>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</dt>
                  <dd className="mt-1.5 text-sm font-extrabold text-pcg-ink">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => onDelete(product)} className="inline-flex items-center justify-center gap-2 border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
            <Trash2 size={16} /> Supprimer
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {product.published && (
              <Link to={`/boutique/${product.slug}`} target="_blank" className="inline-flex items-center justify-center gap-2 border border-slate-300 px-5 py-3 text-sm font-bold text-pcg-ink hover:border-pcg-ink">
                Voir sur le site <ExternalLink size={16} />
              </Link>
            )}
            <Link to={`/admin/produits/${product.id}/modifier`} className="btn-primary">
              Modifier <Edit3 size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
