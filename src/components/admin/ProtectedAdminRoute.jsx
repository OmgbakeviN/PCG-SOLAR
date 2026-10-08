import { AlertTriangle, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, fetchCurrentAdmin } from '../../services/api'
import { authClient, isNeonAuthConfigured } from '../../services/auth'

function LoadingScreen({ message = 'Vérification de la session administrateur…' }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
        <LoaderCircle className="animate-spin" size={20} /> {message}
      </div>
    </main>
  )
}

function AccessDenied({ message }) {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const disconnect = async () => {
    if (signingOut) return
    setSigningOut(true)

    try {
      await authClient.signOut()
    } finally {
      navigate('/admin/login', { replace: true })
      setSigningOut(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
      <section className="w-full max-w-xl border border-red-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="grid h-12 w-12 place-items-center bg-red-50 text-red-600">
          <AlertTriangle size={24} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-red-600">Accès refusé</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-pcg-ink">
          Ce compte ne peut pas administrer PCG SOLAR.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {message || "Votre session Neon Auth est valide, mais ce compte n'est pas présent dans la liste des administrateurs actifs."}
        </p>
        <button type="button" onClick={disconnect} disabled={signingOut} className="btn-primary mt-7 disabled:opacity-60">
          {signingOut ? <LoaderCircle size={17} className="animate-spin" /> : <LogOut size={17} />}
          {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
      </section>
    </main>
  )
}


function SessionMismatch({ message }) {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const reconnect = async () => {
    if (signingOut) return
    setSigningOut(true)

    try {
      await authClient.signOut()
    } finally {
      navigate('/admin/login', { replace: true })
      setSigningOut(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
      <section className="w-full max-w-xl border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="grid h-12 w-12 place-items-center bg-amber-50 text-amber-600">
          <ShieldCheck size={24} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-amber-600">Session à resynchroniser</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-pcg-ink">La connexion existe, mais l’API refuse encore le jeton.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {message || 'Déconnecte-toi puis reconnecte-toi afin que Neon Auth génère un nouveau JWT pour la Function.'}
        </p>
        <p className="mt-4 text-xs leading-5 text-slate-400">
          Cet écran évite désormais la boucle /admin ↔ /admin/login qui provoquait la page blanche et le message de navigation throttled.
        </p>
        <button type="button" onClick={reconnect} disabled={signingOut} className="btn-primary mt-7 disabled:opacity-60">
          {signingOut ? <LoaderCircle size={17} className="animate-spin" /> : <LogOut size={17} />}
          {signingOut ? 'Déconnexion…' : 'Se déconnecter et se reconnecter'}
        </button>
      </section>
    </main>
  )
}

function BackendUnavailable({ message }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
      <section className="w-full max-w-xl border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="grid h-12 w-12 place-items-center bg-amber-50 text-amber-600">
          <ShieldCheck size={24} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-amber-600">Vérification impossible</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-pcg-ink">Le backend d'administration ne répond pas correctement.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-4 text-xs leading-5 text-slate-400">Vérifie le déploiement de la Neon Function puis recharge cette page.</p>
      </section>
    </main>
  )
}

function ProtectedRouteWithAuth() {
  const location = useLocation()
  const session = authClient.useSession()
  const [authorization, setAuthorization] = useState({ status: 'idle', admin: null, message: '' })
  const userId = session.data?.user?.id

  useEffect(() => {
    let cancelled = false

    if (!userId) {
      setAuthorization({ status: 'idle', admin: null, message: '' })
      return () => {
        cancelled = true
      }
    }

    setAuthorization({ status: 'loading', admin: null, message: '' })

    fetchCurrentAdmin()
      .then((admin) => {
        if (!cancelled) {
          setAuthorization({ status: 'authorized', admin, message: '' })
        }
      })
      .catch((error) => {
        if (cancelled) return

        if (error instanceof ApiError && error.status === 403) {
          setAuthorization({ status: 'forbidden', admin: null, message: error.message })
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          setAuthorization({ status: 'unauthorized', admin: null, message: error.message })
          return
        }

        setAuthorization({
          status: 'error',
          admin: null,
          message: error?.message || "Impossible de vérifier les droits d'administration.",
        })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  if (session.isPending) {
    return <LoadingScreen />
  }

  if (!session.data?.user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (authorization.status === 'idle' || authorization.status === 'loading') {
    return <LoadingScreen message="Vérification des droits administrateur…" />
  }

  if (authorization.status === 'unauthorized') {
    return <SessionMismatch message={authorization.message} />
  }

  if (authorization.status === 'forbidden') {
    return <AccessDenied message={authorization.message} />
  }

  if (authorization.status === 'error') {
    return <BackendUnavailable message={authorization.message} />
  }

  return <Outlet context={{ admin: authorization.admin }} />
}

export default function ProtectedAdminRoute() {
  if (!isNeonAuthConfigured) {
    return <Navigate to="/admin/login" replace />
  }

  return <ProtectedRouteWithAuth />
}
