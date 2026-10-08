import { Edit3, Eye, EyeOff, Plus, RefreshCw, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductPreviewModal from '../../components/admin/ProductPreviewModal'
import { useProducts } from '../../context/ProductContext'

export default function AdminProductsPage() {
  const { products, deleteProduct, toggleProductField, refreshAdminData } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (action) => {
    if (busy) return false
    setBusy(true)
    setError('')
    try {
      await action()
      return true
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
      return false
    } finally {
      setBusy(false)
    }
  }

  const remove = async (product) => {
    if (!window.confirm(`Supprimer « ${product.name} » définitivement de Neon ?`)) return
    const success = await run(() => deleteProduct(product.id))
    if (success) setSelectedProduct(null)
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pcg-blue">Catalogue</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-pcg-ink">Produits</h1>
          <p className="mt-2 text-sm text-slate-500">Publiez, masquez, mettez en avant ou modifiez les produits du site.</p>
        </div>
        <Link to="/admin/produits/nouveau" className="btn-primary"><Plus size={17} /> Nouveau produit</Link>
      </div>

      {error && <div role="alert" className="mt-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
      <div className={`mt-9 overflow-x-auto bg-white ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-5 py-4">Produit</th>
              <th className="px-5 py-4">Catégorie</th>
              <th className="px-5 py-4">Puissance</th>
              <th className="px-5 py-4">Publication</th>
              <th className="px-5 py-4">Vedette</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="align-middle hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <button type="button" onClick={() => setSelectedProduct(product)} className="flex items-center gap-4 text-left">
                    <img src={product.image} alt="" className="h-14 w-14 bg-slate-50 object-contain p-1" />
                    <div>
                      <p className="font-extrabold text-pcg-ink hover:text-pcg-blue">{product.name}</p>
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-400">/{product.slug}</p>
                    </div>
                  </button>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">{product.category}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">{product.power}</td>
                <td className="px-5 py-4">
                  <button type="button" onClick={() => run(() => toggleProductField(product.id, 'published'))} disabled={busy} className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] ${product.published ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {product.published ? <Eye size={16} /> : <EyeOff size={16} />} {product.published ? 'Publié' : 'Masqué'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button type="button" onClick={() => run(() => toggleProductField(product.id, 'featured'))} disabled={busy} className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] ${product.featured ? 'text-pcg-solar' : 'text-slate-400'}`}>
                    <Star size={16} fill={product.featured ? 'currentColor' : 'none'} /> {product.featured ? 'Oui' : 'Non'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" title="Aperçu" onClick={() => setSelectedProduct(product)} className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-500 hover:border-pcg-blue hover:text-pcg-blue"><Eye size={16} /></button>
                    <Link to={`/admin/produits/${product.id}/modifier`} title="Modifier" className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-500 hover:border-pcg-blue hover:text-pcg-blue"><Edit3 size={16} /></Link>
                    <button type="button" title="Supprimer" onClick={() => remove(product)} disabled={busy} className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={() => run(refreshAdminData)} disabled={busy} className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400 hover:text-pcg-ink">
        <RefreshCw size={15} /> Actualiser depuis Neon
      </button>

      <ProductPreviewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onDelete={remove} />
    </div>
  )
}
