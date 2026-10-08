import { processSteps } from '../data/siteData'

export default function Process() {
  return (
    <section id="methode" className="bg-pcg-mist py-24 sm:py-28">
      <div className="container-pcg">
        <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <span className="eyebrow">Notre méthode</span>
            <h2 className="section-title mt-5">Un projet solaire clair, du premier échange à la mise en service.</h2>
          </div>
          <p className="section-copy lg:justify-self-end">
            Une bonne installation commence par un processus simple : comprendre, dimensionner, installer et accompagner.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-0">
          <div className="absolute left-0 right-0 top-[23px] hidden h-px bg-slate-300 lg:block" />
          {processSteps.map(({ step, title, text }, index) => (
            <article key={step} className={`relative ${index > 0 ? 'lg:pl-8' : ''} ${index < processSteps.length - 1 ? 'lg:pr-8' : ''}`}>
              <div className="relative z-10 grid h-12 w-12 place-items-center bg-pcg-mist text-xs font-black tracking-[0.14em] text-pcg-blue ring-1 ring-slate-300">
                {step}
              </div>
              <h3 className="mt-8 text-2xl font-black tracking-[-0.03em] text-pcg-ink">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
