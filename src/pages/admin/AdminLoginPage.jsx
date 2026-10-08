import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { authClient, getAuthErrorMessage, isNeonAuthConfigured } from '../../services/auth'
import { media } from '../../data/siteData'

function AuthConfigurationMissing() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5">
      <div className="w-full max-w-xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Configuration requise</p>
        <h1 className="mt-3 text-2xl font-black text-pcg-ink">Neon Auth n'est pas encore configuré dans Vite.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Ajoute <code className="bg-slate-100 px-1.5 py-1">VITE_NEON_AUTH_URL</code> dans ton fichier <code className="bg-slate-100 px-1.5 py-1">.env.local</code>, puis redémarre <code className="bg-slate-100 px-1.5 py-1">npm run dev</code>.
        </p>
      </div>
    </main>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const session = authClient.useSession()

  if (session.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <LoaderCircle className="animate-spin" size={20} /> Vérification de la session…
        </div>
      </main>
    )
  }

  if (session.data?.user) return <Navigate to={location.state?.from || '/admin'} replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (result?.error) {
        setError(getAuthErrorMessage(result.error, 'Email ou mot de passe incorrect.'))
        return
      }

      await session.refetch?.()
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'Impossible de se connecter pour le moment.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-pcg-ink lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <img src={media.team} alt="Équipe solaire" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-pcg-ink via-pcg-ink/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pcg-solar">PCG SOLAR ADMIN</p>
          <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.04] tracking-[-0.04em] text-white">
            Gérez le catalogue PCG SOLAR depuis un espace administrateur sécurisé.
          </h1>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <img src="/brand/pcg-solar-logo.png" alt="PCG SOLAR" className="h-20 w-auto object-contain object-left" />
          <p className="mt-10 text-xs font-black uppercase tracking-[0.18em] text-pcg-blue">Administration</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-pcg-ink">Connexion</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Connectez-vous avec votre compte administrateur PCG SOLAR.</p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-pcg-ink">Email</span>
              <div className="flex items-center gap-3 border border-slate-300 px-4 py-3.5 focus-within:border-pcg-blue">
                <Mail size={18} className="text-slate-400" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className="min-w-0 flex-1 outline-none"
                  placeholder="admin@pcgsolar.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-pcg-ink">Mot de passe</span>
              <div className="flex items-center gap-3 border border-slate-300 px-4 py-3.5 focus-within:border-pcg-blue">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                  className="min-w-0 flex-1 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowRight size={17} />}
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {import.meta.env.VITE_ENABLE_ADMIN_SETUP === 'true' && (
            <div className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-400">
              Initialisation uniquement : <Link to="/admin/setup" className="font-bold text-pcg-blue hover:underline">créer le premier compte administrateur</Link>.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default function AdminLoginPage() {
  if (!isNeonAuthConfigured) return <AuthConfigurationMissing />
  return <LoginScreen />
}
