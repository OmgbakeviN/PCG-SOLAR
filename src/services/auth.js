import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

export const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim() || ''
export const isNeonAuthConfigured = Boolean(neonAuthUrl)

// L'URL factice évite de faire planter le bundle si la variable n'est pas encore
// renseignée. Les écrans d'authentification bloquent les appels tant que
// VITE_NEON_AUTH_URL n'est pas configurée.
const clientUrl = neonAuthUrl || 'https://neon-auth-not-configured.invalid/auth'

export const authClient = createAuthClient(clientUrl, {
  adapter: BetterAuthReactAdapter(),
})

export function getAuthErrorMessage(error, fallback = "Une erreur d'authentification est survenue.") {
  if (!error) return fallback
  return error.message || error.statusText || error.code || fallback
}
