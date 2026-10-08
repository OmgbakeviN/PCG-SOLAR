import { CheckCircle2 } from 'lucide-react'
import { advantages, media } from '../data/siteData'

export default function WhyPcg() {
  return (
    <section id="a-propos" className="py-24 sm:py-28">
      <div className="container-pcg grid gap-12 lg:grid-cols-[1.02fr_.98fr] lg:items-stretch">
        <div className="relative min-h-[580px] overflow-hidden bg-slate-200">
          <img src={media.engineer} alt="Ingénieur inspectant une installation photovoltaïque" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-pcg-ink/90 via-pcg-ink/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-10">
            <p className="max-w-xl text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">
              Une installation doit être comprise, contrôlée et maintenable — pas seulement livrée.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="eyebrow">Pourquoi PCG SOLAR</span>
          <h2 className="section-title mt-5">De l’énergie solaire avec une logique d’ingénierie et de service.</h2>
          <p className="section-copy mt-6">
            Nous voulons que chaque projet soit facile à comprendre aujourd’hui et facile à faire évoluer demain.
          </p>

          <div className="mt-10 border-t border-slate-200">
            {advantages.map(({ icon: Icon, title, text }) => (
              <div key={title} className="grid grid-cols-[auto_1fr] gap-5 border-b border-slate-200 py-6">
                <div className="pt-1 text-pcg-blue">
                  <Icon size={23} />
                </div>
                <div>
                  <h3 className="font-black text-pcg-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-pcg-ink">
            {['Architecture cohérente', 'Choix expliqués', 'Projet évolutif'].map((label) => (
              <span key={label} className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-pcg-solar" /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
