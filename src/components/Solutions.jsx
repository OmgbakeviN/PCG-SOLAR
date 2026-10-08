import { ArrowUpRight } from 'lucide-react'
import { media, solutionCards } from '../data/siteData'

export default function Solutions() {
  return (
    <section id="solutions" className="py-24 sm:py-28">
      <div className="container-pcg">
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <span className="eyebrow">Nos solutions</span>
            <h2 className="section-title mt-5">Trois contextes. Une même exigence : partir du besoin réel.</h2>
          </div>
          <p className="section-copy lg:justify-self-end">
            PCG SOLAR ne commence pas par vendre un kit. Nous observons la consommation, le site, les priorités et le niveau d’autonomie recherché.
          </p>
        </div>

        <div className="mt-14 grid border-y border-slate-200 lg:grid-cols-3">
          {solutionCards.map(({ icon: Icon, title, text, tag }, index) => (
            <article
              key={title}
              className={`group py-9 lg:px-8 lg:py-11 ${index > 0 ? 'border-t border-slate-200 lg:border-l lg:border-t-0' : ''}`}
            >
              <div className="flex items-start justify-between">
                <Icon size={28} className="text-pcg-blue" />
                <span className="text-xs font-black tracking-[0.16em] text-slate-300">0{index + 1}</span>
              </div>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.16em] text-pcg-solar">{tag}</p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-pcg-ink">{title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{text}</p>
              <a href="#contact" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-pcg-ink">
                Étudier ce besoin <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </article>
          ))}
        </div>

        <div className="mt-14 grid overflow-hidden bg-pcg-ink lg:grid-cols-[1.1fr_.9fr]">
          <div className="min-h-[360px]">
            <img src={media.team} alt="Équipe de techniciens installant des panneaux solaires" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center p-8 text-white sm:p-10 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pcg-solar">Du plan au terrain</p>
            <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
              La qualité d’un système dépend aussi de la qualité de son installation.
            </h3>
            <p className="mt-5 max-w-xl leading-7 text-white/65">
              Le choix du matériel ne suffit pas. Implantation, câblage, protection, accès et maintenance doivent être pensés ensemble.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
