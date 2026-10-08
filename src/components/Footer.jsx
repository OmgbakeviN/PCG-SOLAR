import { ArrowUpRight, LockKeyhole, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#051426] py-14 text-white">
      <div className="container-pcg">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.3fr_.7fr_.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/brand/pcg-solar-mark.png" alt="PCG SOLAR" className="h-12 w-12 object-contain" />
              <div>
                <p className="font-black tracking-[0.12em]">PCG SOLAR</p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-white/45">ENERGY SOLUTIONS</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/50">Solutions photovoltaïques, stockage d'énergie et accompagnement pour des projets conçus autour des usages réels.</p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">Navigation</p>
            <div className="mt-5 space-y-3 text-sm font-bold text-white/70">
              <Link to="/#a-propos" className="block hover:text-pcg-solar">À propos</Link>
              <Link to="/boutique" className="block hover:text-pcg-solar">Boutique</Link>
              <Link to="/#produits-en-vedette" className="block hover:text-pcg-solar">Produits</Link>
              <Link to="/#contact" className="block hover:text-pcg-solar">Contact</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">Contact</p>
            <div className="mt-5 space-y-4 text-sm text-white/65">
              <a href="mailto:contact@pcgsolar.com" className="flex items-center gap-3 hover:text-white"><Mail size={16} className="text-pcg-solar" /> contact@pcgsolar.com</a>
              <a href="tel:+237000000000" className="flex items-center gap-3 hover:text-white"><Phone size={16} className="text-pcg-solar" /> +237 000 000 000</a>
              <span className="flex items-center gap-3"><MapPin size={16} className="text-pcg-solar" /> Cameroun</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PCG SOLAR. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/admin/login" className="inline-flex items-center gap-2 font-bold text-white/35 hover:text-white"><LockKeyhole size={13} /> Administration</Link>
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-white/55 hover:text-pcg-solar">Retour en haut <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
