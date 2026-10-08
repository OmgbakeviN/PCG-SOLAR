import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { media } from '../data/siteData'

export default function Hero() {
  return (
    <section id="accueil" className="relative min-h-[650px] overflow-hidden bg-pcg-ink pt-[78px] text-white">
      <div className="absolute inset-0">
        <img
          src={media.hero}
          alt="Installation de panneaux solaires"
          className="h-full w-full object-cover object-center lg:object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06182c]/95 via-[#06182c]/78 to-[#06182c]/25" />
      </div>

      <div className="container-pcg relative flex min-h-[572px] items-center py-16">
        <div className="max-w-[720px]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-pcg-solar">Énergie solaire • Cameroun</p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Une énergie fiable pour votre maison et votre activité.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            PCG SOLAR fournit des solutions photovoltaïques, batteries et équipements adaptés aux besoins des particuliers et des professionnels.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/boutique" className="btn-primary">
              Voir nos produits <ArrowRight size={17} />
            </Link>
            <a href="#a-propos" className="inline-flex items-center justify-center border border-white/35 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white hover:text-pcg-ink">
              Découvrir PCG SOLAR
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
