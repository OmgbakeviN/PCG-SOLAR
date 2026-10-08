import { Boxes, ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, PackagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { authClient } from '../../services/auth'
import { useProducts } from '../../context/ProductContext'

const links = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits', icon: Boxes },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { to: '/admin/produits/nouveau', label: 'Ajouter un produit', icon: PackagePlus },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const navigate = useNavigate()
  const session = authClient.useSession()
  const user = session.data?.user
  const { loading, error, refreshAdminData } = useProducts()

  useEffect(() => {
    refreshAdminData().catch(() => {})
  }, [refreshAdminData])

  const disconnect = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authClient.signOut()
      navigate('/admin/login', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  const sidebar = (
    <>
      <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-6">
        <Link to="/admin" className="flex items-center gap-3">
          <img src="/brand/pcg-solar-mark.png" alt="PCG SOLAR" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-sm font-extrabold tracking-[0.12em] text-white">PCG SOLAR</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Administration</p>
          </div>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="text-white/70 lg:hidden"><X size={20} /></button>
      </div>

      <nav className="flex-1 px-4 py-6">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 px-4 py-3 text-sm font-bold transition ${
                isActive ? 'bg-pcg-solar text-pcg-ink' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        {user?.email && (
          <div className="mb-2 px-4 py-3">
            <p className="truncate text-xs font-extrabold text-white/80">{user.name || 'Administrateur'}</p>
            <p className="mt-1 truncate text-[11px] text-white/40">{user.email}</p>
          </div>
        )}
        <Link to="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/55 hover:text-white">
          <ExternalLink size={17} /> Voir le site
        </Link>
        <button type="button" onClick={disconnect} disabled={signingOut} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-white/55 hover:text-white disabled:opacity-50">
          <LogOut size={17} /> {signingOut ? 'Déconnexion…' : 'Déconnexion'}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col bg-pcg-ink lg:flex">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Fermer" className="absolute inset-0 bg-slate-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[285px] flex-col bg-pcg-ink shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center border border-slate-200 lg:hidden">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">PCG SOLAR</p>
              <p className="mt-1 text-sm font-extrabold text-pcg-ink">Gestion du catalogue</p>
            </div>
          </div>
          <Link to="/boutique" target="_blank" className="hidden items-center gap-2 text-sm font-extrabold text-pcg-blue sm:inline-flex">
            Ouvrir la boutique <ExternalLink size={16} />
          </Link>
        </header>

        <main className="p-5 sm:p-8 lg:p-10">
          {loading ? (
            <p className="py-12 text-sm font-semibold text-slate-500" role="status">Chargement des produits et catégories depuis Neon…</p>
          ) : error ? (
            <div className="border border-red-200 bg-white p-7" role="alert">
              <p className="font-bold text-red-700">Impossible de charger le catalogue : {error}</p>
              <button type="button" onClick={() => refreshAdminData().catch(() => {})} className="btn-primary mt-4">Réessayer</button>
            </div>
          ) : <Outlet />}
        </main>
      </div>
    </div>
  )
}
