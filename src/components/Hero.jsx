import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { media } from '../data/siteData'

export default function Hero() {
  return (
    <section id="accueil" className="pcg-home-hero" aria-labelledby="pcg-hero-title">
      <div className="pcg-home-hero__photo" aria-hidden="true">
        <img
          src={media.hero}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="pcg-home-hero__shade" aria-hidden="true" />

      <div className="container-pcg pcg-home-hero__inner">
        <div className="pcg-home-hero__content">
          <p className="pcg-home-kicker pcg-home-kicker--light">
            Pour les maisons, les commerces et les entreprises
          </p>
          <h1 id="pcg-hero-title" className="pcg-home-display pcg-home-hero__title">
            Le solaire, pensé pour la vraie vie.
          </h1>
          <p className="pcg-home-hero__intro">
            Panneaux, batteries, onduleurs et kits solaires : des équipements
            pour construire un projet adapté à vos besoins.
          </p>
          <div className="pcg-home-hero__actions">
            <Link to="/boutique" className="pcg-home-button pcg-home-button--solar">
              Découvrir nos produits <ArrowUpRight aria-hidden="true" size={19} />
            </Link>
            <a className="pcg-home-text-link pcg-home-text-link--light" href="#contact">
              Parler de mon projet <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </div>
        </div>
      </div>

      <a className="pcg-home-hero__scroll" href="#a-propos" aria-label="Découvrir PCG SOLAR">
        <ChevronDown aria-hidden="true" size={22} />
      </a>
      <p className="pcg-home-hero__caption">Une énergie qui accompagne vos journées.</p>
    </section>
  )
}
