import { CheckCircle2, LoaderCircle, ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authClient, getAuthErrorMessage, isNeonAuthConfigured } from '../../services/auth'

const setupEnabled = import.meta.env.VITE_ENABLE_ADMIN_SETUP === 'true'

function SetupUnavailable({ title, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-8 shadow-sm">
        <img src="/brand/pcg-solar-logo.png" alt="PCG SOLAR" className="h-16 w-auto object-contain object-left" />
        <h1 className="mt-8 text-2xl font-black text-pcg-ink">{title}</h1>
        <div className="mt-4 text-sm leading-6 text-slate-600">{children}</div>
        <Link to="/admin/login" className="mt-7 inline-flex text-sm font-extrabold text-pcg-blue hover:underline">Retour à la connexion</Link>
      </div>
    </main>
  )
}

export default function AdminSetupPage() {
  const [name, setName] = useState('Administrateur PCG SOLAR')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdEmail, setCreatedEmail] = useState('')

  if (!isNeonAuthConfigured) {
    return (
      <SetupUnavailable title="Neon Auth n'est pas configuré">
        Ajoute <code className="bg-slate-100 px-1.5 py-1">VITE_NEON_AUTH_URL</code> dans <code className="bg-slate-100 px-1.5 py-1">.env.local</code>, puis redémarre Vite.
      </SetupUnavailable>
    )
  }

  if (!setupEnabled) {
    return (
      <SetupUnavailable title="Initialisation administrateur désactivée">
        Cette page est volontairement fermée. Pour créer le tout premier compte, mets temporairement <code className="bg-slate-100 px-1.5 py-1">VITE_ENABLE_ADMIN_SETUP=true</code> dans <code className="bg-slate-100 px-1.5 py-1">.env.local</code>, redémarre Vite, crée le compte, puis remets cette variable à <code className="bg-slate-100 px-1.5 py-1">false</code>.
      </SetupUnavailable>
    )
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Utilise un mot de passe d’au moins 8 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: normalizedEmail,
        password,
      })

      if (result?.error) {
        setError(getAuthErrorMessage(result.error, 'Impossible de créer le compte.'))
        return
      }

      // Better Auth peut ouvrir une session immédiatement après l'inscription.
      // On la ferme volontairement : l'utilisateur doit d'abord être ajouté à
      // public.admin_users avant d'utiliser l'administration.
      try {
        await authClient.signOut()
      } catch {
        // La création du compte a réussi ; une éventuelle absence de session
        // n'a pas à faire échouer l'étape d'initialisation.
      }

      setCreatedEmail(normalizedEmail)
      setPassword('')
      setConfirmPassword('')
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'Impossible de créer le compte pour le moment.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (createdEmail) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-2xl border border-emerald-200 bg-white p-8 shadow-sm sm:p-10">
          <CheckCircle2 size={38} className="text-emerald-600" />
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Compte Neon Auth créé</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-pcg-ink">Encore une étape avant la connexion.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Le compte <strong>{createdEmail}</strong> existe maintenant dans Neon Auth. Ajoute-le à <code className="bg-slate-100 px-1.5 py-1">admin_users</code> depuis le SQL Editor avant de continuer.
          </p>
          <pre className="mt-6 overflow-x-auto bg-pcg-ink p-5 text-xs leading-6 text-white"><code>{`INSERT INTO admin_users (user_id, role, is_active)\nSELECT id, 'super_admin', TRUE\nFROM neon_auth."user"\nWHERE email = '${createdEmail}'\nON CONFLICT (user_id) DO UPDATE SET\n  role = 'super_admin',\n  is_active = TRUE;`}</code></pre>
          <div className="mt-7 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Après cela, remets <code>VITE_ENABLE_ADMIN_SETUP=false</code> (ou supprime la variable), redémarre Vite, puis connecte-toi normalement.
          </div>
          <Link to="/admin/login" className="btn-primary mt-7 inline-flex">Aller à la connexion</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-pcg-ink text-pcg-solar"><ShieldCheck size={22} /></span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pcg-blue">PCG SOLAR</p>
            <p className="text-sm font-bold text-slate-500">Initialisation Neon Auth</p>
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-black tracking-[-0.035em] text-pcg-ink">Créer le premier compte admin</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Cette page est temporaire. Elle crée uniquement l'identité Neon Auth ; l'autorisation PCG SOLAR sera ajoutée juste après dans <code>admin_users</code>.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-pcg-ink">Nom</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-pcg-ink">Email administrateur</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-pcg-ink">Mot de passe</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-pcg-ink">Confirmer le mot de passe</span>
            <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required className="w-full border border-slate-300 px-4 py-3.5 outline-none focus:border-pcg-blue" />
          </label>

          {error && <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <UserPlus size={17} />}
            {submitting ? 'Création…' : 'Créer le compte Neon Auth'}
          </button>
        </form>
      </div>
    </main>
  )
}
