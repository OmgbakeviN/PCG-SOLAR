import { ArrowUpRight, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, onQuickView }) {
  return (
    <article className="group border-t border-slate-200 pt-5">
      <Link to={`/boutique/${product.slug}`} className="block overflow-hidden bg-slate-50">
        <div className="aspect-[4/3] overflow-hidden p-5">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="pt-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pcg-blue">{product.category}</p>
            <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-pcg-ink">{product.name}</h3>
          </div>
          <span className="whitespace-nowrap text-sm font-extrabold text-slate-600">{product.power}</span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">{product.shortDescription}</p>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <span className="text-sm font-extrabold text-pcg-ink">{product.price}</span>
          <div className="flex items-center gap-3">
            {onQuickView && (
              <button type="button" onClick={() => onQuickView(product)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-pcg-blue">
                <Eye size={15} /> Aperçu
              </button>
            )}
            <Link to={`/boutique/${product.slug}`} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-pcg-solar hover:text-pcg-ink">
              Détails <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
