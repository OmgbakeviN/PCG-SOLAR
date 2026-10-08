import { ArrowUpRight } from 'lucide-react'
import { media } from '../data/siteData'

const previews = [
  {
    title: 'Installation en toiture',
    text: 'Accès, fixation, orientation et sécurité doivent être intégrés dès la conception.',
    image: media.carrying,
    position: 'object-center',
  },
  {
    title: 'Inspection & maintenance',
    text: 'Une installation lisible simplifie le contrôle et les interventions futures.',
    image: media.inspection,
    position: 'object-center',
  },
  {
    title: 'Travail d’équipe',
    text: 'Les performances finales dépendent autant du matériel que de la qualité de mise en œuvre.',
    image: media.team,
    position: 'object-center',
  },
]

export default function ProjectsPreview() {
  return (
    <section className="py-24 sm:py-28">
      <div className="container-pcg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Le solaire sur le terrain</span>
            <h2 className="section-title mt-5">Plus de technique. Plus d’humain. Moins de décor.</h2>
          </div>
          <p className="section-copy max-w-xl">
            Ces visuels illustrent les situations auxquelles le futur site donnera une place importante : étude, installation et maintenance.
          </p>
        </div>

        <div className="mt-12 grid gap-3 lg:grid-cols-12 lg:grid-rows-2">
          {previews.map((item, index) => (
            <article
              key={item.title}
              className={`group relative min-h-[320px] overflow-hidden ${index === 0 ? 'lg:col-span-7 lg:row-span-2 lg:min-h-[660px]' : 'lg:col-span-5 lg:min-h-[324px]'}`}
            >
              <img src={item.image} alt={item.title} className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${item.position}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-pcg-ink/90 via-pcg-ink/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-8">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-black tracking-[-0.03em]">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">{item.text}</p>
                  </div>
                  <ArrowUpRight className="shrink-0 text-pcg-solar transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
