import { BatteryCharging, PanelsTopLeft, PlugZap, Wrench } from 'lucide-react'

const items = [
  [PanelsTopLeft, 'Photovoltaïque'],
  [BatteryCharging, 'Stockage'],
  [PlugZap, 'Gestion d’énergie'],
  [Wrench, 'Installation'],
]

export default function IntroStrip() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-pcg grid sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([Icon, label], index) => (
          <div
            key={label}
            className={`flex items-center gap-4 py-6 sm:px-5 lg:px-7 ${index > 0 ? 'lg:border-l lg:border-slate-200' : ''}`}
          >
            <Icon size={21} className="shrink-0 text-pcg-solar" />
            <span className="text-sm font-extrabold text-pcg-ink">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
