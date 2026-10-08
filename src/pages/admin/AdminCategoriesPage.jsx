import { Check, Edit3, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useProducts } from '../../context/ProductContext'

const emptyForm = { name: '', slug: '', description: '', active: true }

export default function AdminCategoriesPage() {
  const {
    products,
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
    refreshAdminData,
  } = useProducts()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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

  const counts = useMemo(() => {
    return products.reduce((result, product) => {
      result[product.category] = (result[product.category] || 0) + 1
      return result
    }, {})
  }, [products])

  const startCreate = () => {
    setEditingId('new')
    setForm(emptyForm)
    setError('')
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setForm(category)
    setError('')
  }

  const closeForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const duplicate = categories.some((category) => category.name.toLowerCase() === name.toLowerCase() && category.id !== editingId)
    if (duplicate) {
      setError('Une catégorie avec ce nom existe déjà.')
      return
    }

    const success = await run(() => editingId === 'new'
      ? createCategory({ ...form, name })
      : updateCategory(editingId, { ...form, name }))
    if (success) closeForm()
  }

  const remove = async (category) => {
    const usage = counts[category.name] || 0
    if (usage > 0) {
      setError(`Impossible de supprimer « ${category.name} » : ${usage} produit(s) utilisent encore cette catégorie.`)
      return
    }
    if (window.confirm(`Supprimer la catégorie « ${category.name} » définitivement de Neon ?`)) await run(() => deleteCategory(category.id))
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pcg-blue">Catalogue</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-pcg-ink">Catégories</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Créez les catégories utilisées dans la boutique et dans le formulaire d'ajout des produits.</p>
        </div>
        <button type="button" onClick={startCreate} disabled={busy} className="btn-primary"><Plus size={17} /> Nouvelle catégorie</button>
      </div>

      {error && (
        <div className="mt-6 flex items-start justify-between gap-4 border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}><X size={17} /></button>
        </div>
      )}

      {editingId && (
        <form onSubmit={submit} className="mt-8 border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-pcg-ink">{editingId === 'new' ? 'Ajouter une catégorie' : 'Modifier la catégorie'}</h2>
              <p className="mt-1 text-sm text-slate-500">Le nom sera utilisé directement dans les filtres de la boutique.</p>
            </div>
            <button type="button" onClick={closeForm} className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-500"><X size={17} /></button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-pcg-ink">Nom</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" placeholder="Ex. Régulateurs de charge" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-pcg-ink">Slug personnalisé (optionnel)</span>
              <input value={form.slug || ''} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" placeholder="regulateurs-charge" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-pcg-ink">Description</span>
              <textarea rows={3} value={form.description || ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full resize-y border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" placeholder="Courte description de la catégorie" />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-bold text-pcg-ink">
              <span className={`grid h-6 w-6 place-items-center border ${form.active ? 'border-pcg-blue bg-pcg-blue text-white' : 'border-slate-300 bg-white'}`}>
                {form.active && <Check size={14} />}
              </span>
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} className="sr-only" />
              Visible dans la boutique
            </label>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50"><Save size={16} /> {busy ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-5 py-4">Catégorie</th>
              <th className="px-5 py-4">Produits</th>
              <th className="px-5 py-4">Statut</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => {
              const usage = counts[category.name] || 0
              return (
                <tr key={category.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-5">
                    <p className="font-extrabold text-pcg-ink">{category.name}</p>
                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">{category.description || `/${category.slug}`}</p>
                  </td>
                  <td className="px-5 py-5 text-sm font-semibold text-slate-600">{usage}</td>
                  <td className="px-5 py-5">
                    <button type="button" onClick={() => run(() => toggleCategory(category.id))} disabled={busy} className={`text-xs font-bold uppercase tracking-[0.08em] ${category.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {category.active ? 'Visible' : 'Masquée'}
                    </button>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => startEdit(category)} className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-500 hover:border-pcg-blue hover:text-pcg-blue" title="Modifier"><Edit3 size={16} /></button>
                      <button type="button" onClick={() => remove(category)} disabled={usage > 0 || busy} className="grid h-9 w-9 place-items-center border border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30" title={usage > 0 ? 'Catégorie utilisée par des produits' : 'Supprimer'}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={() => run(refreshAdminData)} disabled={busy} className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400 hover:text-pcg-ink">
        <RefreshCw size={15} /> Actualiser depuis Neon
      </button>
    </div>
  )
}
