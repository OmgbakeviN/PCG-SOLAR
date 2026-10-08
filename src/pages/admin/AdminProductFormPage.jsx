import { ArrowLeft, Check, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { deleteProductImage, fetchProductImages, setMainProductImage, uploadProductImage } from '../../services/api'
import ProductImagesEditor from '../../components/admin/ProductImagesEditor'

const emptyProduct = {
  name: '',
  category: 'Panneaux solaires',
  shortDescription: '',
  description: '',
  image: '/products/panel-550.svg',
  price: '',
  power: '',
  brand: 'PCG Selection',
  warranty: 'Garantie selon fabricant',
  availability: 'Disponible',
  featured: false,
  published: true,
  slug: '',
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, categories, createProduct, updateProduct, refreshAdminData } = useProducts()
  const editingProduct = useMemo(() => products.find((product) => product.id === id), [products, id])
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [queuedFiles, setQueuedFiles] = useState([])
  const [images, setImages] = useState([])
  const [mainImageKey, setMainImageKey] = useState(null)
  const [createdId, setCreatedId] = useState(null)
  const [imageBusy, setImageBusy] = useState(false)
  const [uploadingLabel, setUploadingLabel] = useState('')
  const [initializedId, setInitializedId] = useState(null)

  useEffect(() => {
    if (editingProduct) {
      if (initializedId !== editingProduct.id) {
        setForm({ ...editingProduct, price: editingProduct.rawPrice == null ? '' : String(editingProduct.rawPrice) })
        setImages(editingProduct.images || [])
        setMainImageKey(editingProduct.mainImageKey || null)
        setInitializedId(editingProduct.id)
      }
      return
    }
    if (createdId) return
    const defaultCategory = categories.find((item) => item.active)?.name || categories[0]?.name || ''
    setForm((current) => current.name ? current : { ...current, category: defaultCategory })
  }, [editingProduct, categories, createdId, initializedId])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const activeProductId = editingProduct?.id || createdId
  const busy = saving || imageBusy

  const refreshImages = async (productId) => {
    const data = await fetchProductImages(productId)
    setImages(data.images || [])
    setMainImageKey(data.main_image_key || null)
  }

  const chooseMainImage = async (imageId) => {
    if (!activeProductId || busy) return
    setImageBusy(true)
    setError('')
    try {
      await setMainProductImage(activeProductId, imageId)
      await refreshImages(activeProductId)
      await refreshAdminData()
    } catch (err) {
      setError(err.message || 'Impossible de choisir la photo principale.')
    } finally { setImageBusy(false) }
  }

  const deleteImage = async (imageId) => {
    if (!activeProductId || busy || !window.confirm('Supprimer définitivement cette photo ?')) return
    setImageBusy(true)
    setError('')
    try {
      await deleteProductImage(activeProductId, imageId)
      await refreshImages(activeProductId)
      await refreshAdminData()
    } catch (err) {
      setError(err.message || 'Impossible de supprimer la photo.')
    } finally { setImageBusy(false) }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setSaving(true)
    setError('')
    let persistedProductId = activeProductId
    try {
      let productId = activeProductId
      if (productId) {
        await updateProduct(productId, form)
      } else {
        const record = await createProduct(form)
        productId = String(record.id)
        persistedProductId = productId
        setCreatedId(productId) // A failed upload must never re-create the same product on retry.
      }
      // Upload sequentially; successful files leave the queue so retries never duplicate them.
      for (const file of queuedFiles) {
        setUploadingLabel(`Envoi de ${file.name}…`)
        await uploadProductImage(productId, file)
        setQueuedFiles((current) => current.filter((item) => item !== file))
      }
      setUploadingLabel('')
      if (queuedFiles.length) await refreshAdminData()
      navigate('/admin/produits')
    } catch (err) {
      setUploadingLabel('')
      setError(`${err.message || 'Enregistrement impossible.'}${persistedProductId && !editingProduct ? ' Le produit est déjà enregistré : tu peux réessayer les photos restantes.' : ''}`)
    } finally { setSaving(false) }
  }

  if (id && !editingProduct) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold text-pcg-ink">Produit introuvable</h1>
        <Link to="/admin/produits" className="btn-primary mt-6">Retour aux produits</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/admin/produits" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-pcg-ink"><ArrowLeft size={16} /> Retour aux produits</Link>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-pcg-blue">Catalogue</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-pcg-ink">{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
      </div>

      {error && <div role="alert" className="mt-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-9 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-pcg-ink">Informations principales</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Nom du produit" required value={form.name} onChange={(value) => update('name', value)} className="sm:col-span-2" />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-pcg-ink">Catégorie</span>
                <select value={form.category} onChange={(event) => update('category', event.target.value)} className="w-full border border-slate-300 bg-white px-4 py-3.5 outline-none focus:border-pcg-blue">
                  {categories.filter((item) => item.active || item.name === form.category).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </label>

              <Field label="Puissance / capacité" value={form.power} onChange={(value) => update('power', value)} placeholder="Ex. 550 W" />
              <Field label="Prix (FCFA, laisser vide pour Sur devis)" value={form.price} onChange={(value) => update('price', value)} placeholder="Ex. 145000" />
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-pcg-ink">Disponibilité</span>
                <select value={form.availability} onChange={(event) => update('availability', event.target.value)} className="w-full border border-slate-300 bg-white px-4 py-3.5 outline-none focus:border-pcg-blue">
                  {['Disponible', 'Indisponible', 'Sur commande'].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <Field label="Marque / sélection" value={form.brand} onChange={(value) => update('brand', value)} />
              <Field label="Garantie" value={form.warranty} onChange={(value) => update('warranty', value)} />
              <Field label="Slug personnalisé (optionnel)" value={form.slug || ''} onChange={(value) => update('slug', value)} placeholder="panneau-solaire-550w" className="sm:col-span-2" />
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-pcg-ink">Présentation commerciale</h2>
            <div className="mt-6 space-y-5">
              <Textarea label="Résumé" required rows={3} value={form.shortDescription} onChange={(value) => update('shortDescription', value)} />
              <Textarea label="Description complète" required rows={6} value={form.description} onChange={(value) => update('description', value)} />
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <ProductImagesEditor
            images={images} mainImageKey={mainImageKey} queuedFiles={queuedFiles}
            onQueueChange={setQueuedFiles} onChooseMain={chooseMainImage} onDeleteImage={deleteImage}
            onMessage={setError} busy={busy}
          />

          <section className="bg-white p-6">
            <h2 className="text-lg font-extrabold text-pcg-ink">Publication</h2>
            <div className="mt-5 space-y-4">
              <Toggle label="Publié dans la boutique" checked={form.published} onChange={(value) => update('published', value)} />
              <Toggle label="Afficher sur la page d’accueil" checked={form.featured} onChange={(value) => update('featured', value)} />
            </div>
          </section>

          <button type="submit" disabled={busy || !categories.length} className="btn-primary w-full disabled:opacity-50"><Save size={17} /> {saving ? uploadingLabel || 'Enregistrement…' : editingProduct || createdId ? 'Enregistrer les modifications' : 'Enregistrer le produit'}</button>
        </aside>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, required = false, placeholder = '', className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-pcg-ink">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" />
    </label>
  )
}

function Textarea({ label, value, onChange, rows, required }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-pcg-ink">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} required={required} className="w-full resize-y border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" />
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="text-sm font-bold text-pcg-ink">{label}</span>
      <span className={`relative h-7 w-12 transition ${checked ? 'bg-pcg-blue' : 'bg-slate-200'}`}>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
        <span className={`absolute top-1 grid h-5 w-5 place-items-center bg-white transition ${checked ? 'left-6' : 'left-1'}`}>
          {checked && <Check size={12} className="text-pcg-blue" />}
        </span>
      </span>
    </label>
  )
}
