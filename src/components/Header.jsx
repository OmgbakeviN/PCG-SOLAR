import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, ShoppingBag, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/#a-propos' },
  { label: 'Produits', href: '/#produits-en-vedette' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Contact', href: '/#contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-xl'}`}>
      <div className="container-pcg flex h-[78px] items-center justify-between gap-6">
        <Link to="/" className="group flex items-center gap-3" aria-label="PCG SOLAR — Accueil">
          <img src="/brand/pcg-solar-mark.png" alt="PCG SOLAR" className="h-11 w-11 object-contain transition group-hover:scale-105" />
          <div className={`leading-none ${transparent ? 'text-white' : 'text-pcg-ink'}`}>
            <span className="block text-base font-extrabold tracking-[0.1em]">PCG SOLAR</span>
            <span className={`mt-1 block text-[10px] font-semibold tracking-[0.17em] ${transparent ? 'text-white/65' : 'text-slate-500'}`}>ENERGY SOLUTIONS</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className={`text-sm font-semibold transition hover:text-pcg-solar ${transparent ? 'text-white/85' : 'text-slate-700'}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/boutique" aria-label="Boutique" className={`grid h-11 w-11 place-items-center border ${transparent ? 'border-white/20 text-white' : 'border-slate-200 text-pcg-ink'} hover:border-pcg-solar hover:text-pcg-solar`}>
            <ShoppingBag size={18} />
          </Link>
          <a href="/#contact" className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${transparent ? 'bg-white text-pcg-ink hover:bg-pcg-solar' : 'bg-pcg-ink text-white hover:bg-pcg-navy'}`}>
            Demander un devis <ArrowUpRight size={16} />
          </a>
        </div>

        <button type="button" aria-label="Ouvrir le menu" onClick={() => setOpen((value) => !value)} className={`grid h-11 w-11 place-items-center border lg:hidden ${transparent ? 'border-white/20 bg-white/10 text-white' : 'border-slate-200 bg-white text-pcg-ink'}`}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 pb-6 pt-3 shadow-xl lg:hidden">
          <nav className="container-pcg flex flex-col">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setOpen(false)} className="border-b border-slate-100 py-4 text-sm font-bold text-pcg-ink">
                {item.label}
              </Link>
            ))}
            <a href="/#contact" onClick={() => setOpen(false)} className="btn-primary mt-5">Demander un devis <ArrowUpRight size={16} /></a>
          </nav>
        </div>
      )}
    </header>
  )
}
