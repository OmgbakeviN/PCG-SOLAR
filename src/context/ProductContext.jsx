import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  addAdminCategory, addAdminProduct, editAdminCategory, editAdminProduct,
  fetchAdminCategories, fetchAdminProducts, removeAdminCategory, removeAdminProduct,
} from '../services/api'
import { slugify } from '../utils/slugify'

const ProductContext = createContext(null)

const fallbackImages = {
  'panneaux-solaires': '/products/panel-550.svg',
  batteries: '/products/battery-5kwh.svg',
  onduleurs: '/products/inverter-5kw.svg',
  'kits-solaires': '/products/kit-essential.svg',
  accessoires: '/products/kit-essential.svg',
}
const availabilities = { available: 'Disponible', out_of_stock: 'Indisponible', on_order: 'Sur commande' }
const availabilityCodes = { Disponible: 'available', Indisponible: 'out_of_stock', 'Sur commande': 'on_order' }

function normalizeCategory(row) {
  return {
    id: String(row.id), name: row.name, slug: row.slug,
    description: row.description || '', active: row.is_active !== false,
  }
}

function normalizeProduct(row) {
  const price = row.price == null ? 'Sur devis' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(row.price))} FCFA`
  return {
    id: String(row.id), name: row.name, slug: row.slug,
    category: row.category?.name || '', categoryId: String(row.category?.id || ''),
    shortDescription: row.short_description || '', description: row.description || '',
    price, rawPrice: row.price, currency: row.currency || 'XAF',
    image: row.main_image_url || fallbackImages[row.category?.slug] || '/products/panel-550.svg',
    mainImageKey: row.main_image_key || null,
    images: (row.images || []).filter((item) => item.url),
    power: row.power || '', brand: row.brand || '', warranty: row.warranty || '',
    availability: availabilities[row.availability] || 'Disponible',
    featured: row.featured === true, published: row.published === true,
    specifications: row.specifications || {},
  }
}

function toProductPayload(form, categories) {
  const category = categories.find((item) => item.name === form.category)
  if (!category) throw new Error('Sélectionne une catégorie existante.')
  const rawPrice = String(form.price ?? '').trim()
  if (rawPrice && !/^\d{1,12}(\.\d{1,2})?$/.test(rawPrice)) {
    throw new Error('Le prix doit être un nombre en FCFA ou vide pour « Sur devis ».')
  }
  return {
    name: form.name.trim(), slug: slugify(form.slug || form.name),
    category_id: category.id, short_description: form.shortDescription || '',
    description: form.description || '', price: rawPrice || null,
    brand: form.brand || '', power: form.power || '', warranty: form.warranty || '',
    availability: availabilityCodes[form.availability] || 'available',
    published: Boolean(form.published), featured: Boolean(form.featured),
    specifications: form.specifications || {},
  }
}

function toCategoryPayload(form) {
  return {
    name: form.name.trim(), slug: slugify(form.slug || form.name),
    description: form.description || '', is_active: form.active !== false,
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshAdminData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productRows, categoryRows] = await Promise.all([fetchAdminProducts(), fetchAdminCategories()])
      setProducts(productRows.map(normalizeProduct))
      setCategories(categoryRows.map(normalizeCategory))
    } catch (requestError) {
      setError(requestError.message || 'Chargement du catalogue administrateur impossible.')
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = async (payload) => {
    const response = await addAdminProduct(toProductPayload(payload, categories))
    await refreshAdminData()
    return response
  }
  const updateProduct = async (id, payload) => {
    await editAdminProduct(id, toProductPayload(payload, categories))
    await refreshAdminData()
  }
  const deleteProduct = async (id) => {
    await removeAdminProduct(id)
    await refreshAdminData()
  }
  const toggleProductField = async (id, field) => {
    if (!['published', 'featured'].includes(field)) throw new Error('Champ non autorisé.')
    const product = products.find((item) => item.id === String(id))
    if (!product) throw new Error('Produit introuvable.')
    await editAdminProduct(id, { [field]: !product[field] })
    await refreshAdminData()
  }
  const createCategory = async (payload) => {
    const result = await addAdminCategory(toCategoryPayload(payload))
    await refreshAdminData()
    return result
  }
  const updateCategory = async (id, payload) => {
    await editAdminCategory(id, toCategoryPayload(payload))
    await refreshAdminData()
  }
  const deleteCategory = async (id) => {
    await removeAdminCategory(id)
    await refreshAdminData()
    return true
  }
  const toggleCategory = async (id) => {
    const category = categories.find((item) => item.id === String(id))
    if (!category) throw new Error('Catégorie introuvable.')
    await editAdminCategory(id, { is_active: !category.active })
    await refreshAdminData()
  }

  const value = useMemo(() => ({
    products, categories, loading, error, refreshAdminData,
    createProduct, updateProduct, deleteProduct, toggleProductField,
    createCategory, updateCategory, deleteCategory, toggleCategory,
  }), [products, categories, loading, error, refreshAdminData])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts must be used inside ProductProvider')
  return context
}
