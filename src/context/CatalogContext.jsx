import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchPublicCategories, fetchPublicProducts } from '../services/api'

const CatalogContext = createContext(null)

const fallbackImages = {
  'panneaux-solaires': '/products/panel-550.svg',
  batteries: '/products/battery-5kwh.svg',
  onduleurs: '/products/inverter-5kw.svg',
  'kits-solaires': '/products/kit-essential.svg',
  'kits-accessoires': '/products/kit-essential.svg',
  accessoires: '/products/kit-essential.svg',
}

function getProductImage(product) {
  return product.main_image_url || fallbackImages[product.category?.slug] || '/products/panel-550.svg'
}

function formatPrice(value, currency = 'XAF') {
  if (value === null || value === undefined || value === '') return 'Sur devis'

  const amount = Number(value)
  if (Number.isNaN(amount)) return String(value)

  if (currency === 'XAF') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} FCFA`
  }

  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function formatAvailability(value) {
  const labels = {
    available: 'Disponible',
    out_of_stock: 'Indisponible',
    on_order: 'Sur commande',
  }

  return labels[value] || value || 'À confirmer'
}

function normalizeCategory(category) {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    active: category.is_active !== false,
  }
}

function normalizeProduct(product) {
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    category: product.category?.name || '',
    categoryId: product.category?.id ? String(product.category.id) : '',
    categorySlug: product.category?.slug || '',
    shortDescription: product.short_description || '',
    description: product.description || '',
    image: getProductImage(product),
    mainImageKey: product.main_image_key || null,
    images: (product.images || []).filter((item) => item.url),
    price: formatPrice(product.price, product.currency),
    rawPrice: product.price,
    currency: product.currency || 'XAF',
    power: product.power || '',
    brand: product.brand || '',
    warranty: product.warranty || '',
    availability: formatAvailability(product.availability),
    featured: Boolean(product.featured),
    published: product.published !== false,
    specifications: product.specifications || {},
  }
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshCatalog = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [productRows, categoryRows] = await Promise.all([
        fetchPublicProducts(),
        fetchPublicCategories(),
      ])

      setProducts(productRows.map(normalizeProduct))
      setCategories(categoryRows.map(normalizeCategory))
    } catch (requestError) {
      console.error('PCG Solar catalog API error:', requestError)
      setProducts([])
      setCategories([])
      setError(requestError.message || 'Impossible de charger le catalogue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCatalog()
  }, [refreshCatalog])

  const value = useMemo(
    () => ({
      products,
      categories,
      loading,
      error,
      refreshCatalog,
    }),
    [products, categories, loading, error, refreshCatalog],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider')
  return context
}
