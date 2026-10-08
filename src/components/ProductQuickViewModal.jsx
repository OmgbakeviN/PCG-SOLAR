import { Check, MessageCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProductQuickViewModal({ product, onClose, detailMode = false }) {
  const [selectedImage, setSelectedImage] = useState('')
  useEffect(() => { setSelectedImage(product?.image || '') }, [product?.id, product?.image])
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

  const handleQuoteClick = () => {
    onClose()
    window.setTimeout(() => {
      window.location.href = '/#contact'
    }, 0)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Détails de ${product.name}`}
    >
      <button type="button" aria-label="Fermer la fenêtre" className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 max-h-[94vh] w-full max-w-5xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pcg-blue">{product.category}</p>
            <p className="mt-1 text-sm font-bold text-pcg-ink">{detailMode ? 'Détail du produit' : 'Aperçu du produit'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center border border-slate-200 text-slate-500 transition hover:border-pcg-ink hover:text-pcg-ink"
            aria-label="Fermer"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="bg-slate-50 p-6 sm:p-8 lg:min-h-[560px] lg:p-10">
            <div className="flex flex-col justify-center gap-5">
              <img src={selectedImage || product.image} alt={product.name} className="aspect-square max-h-[440px] w-full object-contain" />
              {product.images?.length > 1 && <div className="flex flex-wrap gap-2">
                {product.images.map((image) => <button key={image.id} type="button" onClick={() => setSelectedImage(image.url)}
                  className={`h-16 w-16 border-2 p-1 ${selectedImage === image.url ? 'border-pcg-blue' : 'border-slate-200'}`} aria-label="Voir cette photo du produit">
                  <img src={image.url} alt={image.alt_text || product.name} className="h-full w-full object-contain" />
                </button>)}
              </div>}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.035em] text-pcg-ink sm:text-4xl">
              {product.name}
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">{product.description}</p>

            <div className="mt-8 grid border-y border-slate-200 sm:grid-cols-2">
              {[
                ['Puissance / capacité', product.power],
                ['Disponibilité', product.availability],
                ['Marque / sélection', product.brand],
                ['Tarification', product.price],
                ['Garantie', product.warranty],
                ['Catégorie', product.category],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`py-4 ${index % 2 ? 'sm:border-l sm:border-slate-200 sm:pl-5' : 'sm:pr-5'} ${index > 1 ? 'border-t border-slate-200' : ''}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">{label}</p>
                  <p className="mt-1.5 text-sm font-bold text-pcg-ink">{value || 'À confirmer'}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 space-y-3">
              <p className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <Check size={17} className="mt-0.5 shrink-0 text-pcg-blue" />
                Étude et dimensionnement avant validation finale de l'installation.
              </p>
              <p className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <Check size={17} className="mt-0.5 shrink-0 text-pcg-blue" />
                Installation et accompagnement possibles par l'équipe PCG SOLAR.
              </p>
              <p className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <Check size={17} className="mt-0.5 shrink-0 text-pcg-blue" />
                La configuration finale peut être adaptée à votre consommation et à votre budget.
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center border border-slate-300 px-5 py-3 text-sm font-bold text-pcg-ink transition hover:border-pcg-ink"
          >
            Fermer
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="https://wa.me/237000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-pcg-ink px-5 py-3 text-sm font-bold text-pcg-ink transition hover:bg-pcg-ink hover:text-white"
            >
              <MessageCircle size={17} /> WhatsApp
            </a>
            <button type="button" onClick={handleQuoteClick} className="btn-primary">
              Demander un devis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
