import { BatteryCharging, ShieldCheck, SunMedium } from 'lucide-react'

const values = [
  {
    icon: SunMedium,
    title: 'Solutions adaptées',
    text: 'Nous orientons le choix des équipements selon le besoin réel du site et les usages prioritaires.',
  },
  {
    icon: ShieldCheck,
    title: 'Équipements fiables',
    text: 'Notre catalogue est organisé autour de composants solaires utiles, cohérents et simples à maintenir.',
  },
  {
    icon: BatteryCharging,
    title: 'Autonomie maîtrisée',
    text: 'Production et stockage sont pensés ensemble pour améliorer la continuité énergétique au quotidien.',
  },
]

export default function HomeValues() {
  return (
    <section className="bg-pcg-mist py-20 sm:py-24">
      <div className="container-pcg">
        <div className="max-w-2xl">
          <span className="eyebrow">Pourquoi PCG SOLAR</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.035em] text-pcg-ink sm:text-4xl">Une approche claire, sans complexité inutile.</h2>
        </div>

        <div className="mt-12 grid border-y border-slate-300 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className={`py-8 md:px-8 ${index > 0 ? 'border-t border-slate-300 md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
              <Icon size={28} className="text-pcg-blue" />
              <h3 className="mt-7 text-xl font-extrabold text-pcg-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
