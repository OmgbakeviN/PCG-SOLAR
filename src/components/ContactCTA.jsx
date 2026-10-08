import { ArrowRight, MessageCircle, PhoneCall } from 'lucide-react'

export default function ContactCTA() {
  return (
    <section id="contact" className="pb-24 sm:pb-28">
      <div className="container-pcg">
        <div className="grid overflow-hidden bg-pcg-solar lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="p-7 sm:p-10 lg:p-14">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-pcg-ink/55">Votre projet commence ici</span>
            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-[-0.045em] text-pcg-ink sm:text-4xl lg:text-5xl">
              Parlons de votre consommation avant de parler de panneaux.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-pcg-ink/70">
              Décrivez-nous votre besoin. L’équipe PCG SOLAR pourra ensuite vous orienter vers une étude et une solution adaptée.
            </p>
          </div>

          <div className="flex flex-col border-t border-pcg-ink/15 lg:min-w-[310px] lg:border-l lg:border-t-0">
            <a href="mailto:contact@pcgsolar.com" className="inline-flex min-h-[92px] items-center justify-between gap-4 border-b border-pcg-ink/15 px-7 text-sm font-extrabold text-pcg-ink transition hover:bg-white/25">
              <span className="inline-flex items-center gap-3"><MessageCircle size={18} /> Nous écrire</span>
              <ArrowRight size={17} />
            </a>
            <a href="tel:+237000000000" className="inline-flex min-h-[92px] items-center justify-between gap-4 px-7 text-sm font-extrabold text-pcg-ink transition hover:bg-white/25">
              <span className="inline-flex items-center gap-3"><PhoneCall size={18} /> Être rappelé</span>
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
