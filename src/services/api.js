import { authClient, neonAuthUrl } from './auth'

const rawBaseUrl = import.meta.env.VITE_API_URL?.trim()

export const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/$/, '') : ''

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function ensureApiConfigured() {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_URL est manquant. Crée un fichier .env.local à la racine avec VITE_API_URL=https://... puis redémarre Vite.',
    )
  }
}

async function apiRequest(path, options = {}) {
  ensureApiConfigured()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || `Erreur API (${response.status})`, response.status, payload)
  }

  if (payload?.success === false) {
    throw new ApiError(payload.message || 'La requête API a échoué.', response.status, payload)
  }

  return payload
}

function isJwt(value) {
  // Un jeton de session opaque (comme celui de signIn.email) n'est PAS un JWT.
  // La signature et l'expiration sont vérifiées exclusivement par Neon Function.
  return typeof value === 'string' && value.split('.').length === 3 && value.length > 40
}

async function getBearerToken() {
  // Dans certains SDK Neon, le JWT court est déjà présent dans la session.
  // Les versions plus anciennes n'exposent pas toujours authClient.token().
  // Ne jamais envoyer la valeur opaque signIn.data.token comme Bearer.
  let sessionResult
  try {
    sessionResult = await authClient.getSession()
  } catch (error) {
    throw new ApiError(
      error?.message || 'Impossible de vérifier la session Neon Auth.',
      error?.status || 401,
    )
  }

  if (sessionResult?.error) {
    throw new ApiError(
      sessionResult.error.message || 'La session Neon Auth a expiré.',
      sessionResult.error.status || 401,
    )
  }

  const session = sessionResult?.data?.session
  if (!sessionResult?.data?.user || !session) {
    throw new ApiError('Connecte-toi à nouveau pour accéder à l’administration.', 401)
  }

  // Certaines réponses Managed Better Auth contiennent access_token ;
  // d'autres versions du SDK injectent le JWT dans session.token.
  const sessionJwt = [session.access_token, session.accessToken, session.jwt, session.token]
    .find(isJwt)

  if (sessionJwt) return sessionJwt

  // Fallback de compatibilité : endpoint JWT officiel Better Auth (/token),
  // et non /get-jwt-token (404 sur Neon Managed Better Auth).
  if (!neonAuthUrl) {
    throw new ApiError('VITE_NEON_AUTH_URL est manquant dans .env.local.', 500)
  }

  let response
  try {
    response = await fetch(`${neonAuthUrl.replace(/\/+$/, '')}/token`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new ApiError('Impossible de joindre Neon Auth pour obtenir le JWT.', 503)
  }

  // Éviter de loguer ou d'afficher des jetons et autres détails de session.
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = response.status === 404
      ? 'Neon Auth ne fournit pas /token sur cette branche. Vérifie le service Auth de development et son URL.'
      : response.status === 401
        ? 'Ta session a expiré. Déconnecte-toi puis reconnecte-toi.'
        : `Impossible de récupérer le JWT Neon Auth (HTTP ${response.status}).`
    throw new ApiError(message, response.status)
  }

  const token = [payload?.token, payload?.data?.token, payload?.access_token]
    .find(isJwt)

  if (!token) {
    throw new ApiError('La réponse /token ne contient pas de JWT valide.', 502)
  }

  return token
}

async function authenticatedApiRequest(path, options = {}) {
  const token = await getBearerToken()

  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function fetchPublicProducts() {
  const payload = await apiRequest('/products')
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function fetchPublicCategories() {
  const payload = await apiRequest('/categories')
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function fetchPublicProduct(slug) {
  const payload = await apiRequest(`/products/${encodeURIComponent(slug)}`)
  return payload?.data || null
}

export async function fetchCurrentAdmin() {
  const payload = await authenticatedApiRequest('/admin/me')
  return payload?.data || null
}

// Administration : ces routes sont sécurisées par JWT + public.admin_users
// côté Neon Function, et pas seulement par React Router.
export async function fetchAdminProducts() {
  const payload = await authenticatedApiRequest('/admin/products')
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function fetchAdminCategories() {
  const payload = await authenticatedApiRequest('/admin/categories')
  return Array.isArray(payload?.data) ? payload.data : []
}

async function adminMutation(path, method, data) {
  const payload = await authenticatedApiRequest(path, {
    method,
    headers: data === undefined ? {} : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
  return payload?.data ?? null
}

export const addAdminProduct = (data) => adminMutation('/admin/products', 'POST', data)
export const editAdminProduct = (id, data) => adminMutation(`/admin/products/${encodeURIComponent(id)}`, 'PATCH', data)
export const removeAdminProduct = (id) => adminMutation(`/admin/products/${encodeURIComponent(id)}`, 'DELETE')
export const addAdminCategory = (data) => adminMutation('/admin/categories', 'POST', data)
export const editAdminCategory = (id, data) => adminMutation(`/admin/categories/${encodeURIComponent(id)}`, 'PATCH', data)
export const removeAdminCategory = (id) => adminMutation(`/admin/categories/${encodeURIComponent(id)}`, 'DELETE')


// Authenticated multipart uploads. Never set Content-Type manually for FormData.
export async function uploadProductImage(productId, file) {
  const body = new FormData()
  body.append('image', file)
  const payload = await authenticatedApiRequest(`/admin/products/${encodeURIComponent(productId)}/images`, {
    method: 'POST', body,
  })
  return payload?.data || null
}

export async function fetchProductImages(productId) {
  const payload = await authenticatedApiRequest(`/admin/products/${encodeURIComponent(productId)}/images`)
  return payload?.data || { images: [], main_image_key: null }
}

export async function setMainProductImage(productId, imageId) {
  const payload = await authenticatedApiRequest(`/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}/main`, { method: 'PATCH' })
  return payload?.data || null
}

export async function deleteProductImage(productId, imageId) {
  const payload = await authenticatedApiRequest(`/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, { method: 'DELETE' })
  return payload?.data || null
}
