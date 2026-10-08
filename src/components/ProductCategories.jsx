import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productCategories } from '../data/siteData'

export default function ProductCategories() {
  return (
    <section id="produits" className="bg-[#071b33] py-24 text-white sm:py-28">
      <div className="container-pcg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-pcg-solar">Produits & équipements</span>
            <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Les bons composants, assemblés comme un seul système.
            </h2>
          </div>
          <Link to="/boutique" className="inline-flex items-center gap-2 text-sm font-black text-pcg-solar">
            Voir toute la boutique <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-14 grid border-y border-white/15 sm:grid-cols-2 xl:grid-cols-4">
          {productCategories.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className={`group min-h-[300px] py-8 sm:px-7 ${index % 2 === 1 ? 'sm:border-l sm:border-white/15' : ''} ${index > 1 ? 'border-t border-white/15 xl:border-t-0' : ''} ${index > 0 ? 'xl:border-l xl:border-white/15' : ''}`}>
              <div className="flex items-center justify-between">
                <Icon size={27} className="text-pcg-solar" />
                <span className="text-xs font-black tracking-[0.16em] text-white/25">0{index + 1}</span>
              </div>
              <h3 className="mt-14 text-xl font-black tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
              <div className="mt-8 h-[2px] w-10 bg-pcg-solar transition-all duration-300 group-hover:w-24" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
