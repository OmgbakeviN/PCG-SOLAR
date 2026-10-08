import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { media } from '../data/siteData'

export default function HomeAbout() {
  return (
    <section id="a-propos" className="bg-white py-20 sm:py-24">
      <div className="container-pcg grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <img src={media.team} alt="Équipe travaillant autour d'une installation solaire" className="aspect-[4/3] w-full object-cover" />
          <div className="absolute bottom-0 left-0 bg-pcg-solar px-6 py-4 text-sm font-extrabold text-pcg-ink">
            Solutions solaires adaptées aux usages réels
          </div>
        </div>

        <div>
          <span className="eyebrow">À propos de nous</span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-pcg-ink sm:text-4xl">
            Produire, stocker et mieux utiliser votre énergie.
          </h2>
          <p className="mt-6 text-base leading-7 text-slate-600">
            PCG SOLAR accompagne les ménages, commerces et entreprises dans le choix de solutions solaires fiables. Notre objectif est simple : proposer des équipements cohérents avec le besoin, le budget et le niveau d'autonomie recherché.
          </p>
          <div className="mt-7 space-y-3">
            {['Panneaux solaires et kits', 'Batteries et stockage', 'Onduleurs et équipements', 'Accompagnement et installation'].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm font-semibold text-pcg-ink">
                <CheckCircle2 size={18} className="text-pcg-blue" /> {item}
              </p>
            ))}
          </div>
          <Link to="/boutique" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-pcg-blue hover:text-pcg-ink">
            Explorer la boutique <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
