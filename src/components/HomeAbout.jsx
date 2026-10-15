import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { media } from '../data/siteData'

const equipment = [
  'Panneaux solaires et kits',
  'Batteries et stockage',
  'Onduleurs et accessoires',
]

export default function HomeAbout() {
  return (
    <section id="a-propos" className="pcg-home-about" aria-labelledby="pcg-about-title">
      <div className="container-pcg pcg-home-about__grid">
        <div className="pcg-home-about__visual">
          <img
            src={media.team}
            alt="Des professionnels interviennent sur un projet d’énergie solaire"
            loading="lazy"
            decoding="async"
          />
          <div className="pcg-home-about__visual-tag">Des solutions pensées pour vos usages</div>
        </div>

        <div className="pcg-home-about__content">
          <p className="pcg-home-kicker">PCG SOLAR, à vos côtés</p>
          <h2 id="pcg-about-title" className="pcg-home-display pcg-home-section-title">
            L'énergie juste, pour chaque besoin.
          </h2>
          <p className="pcg-home-about__lead">
            Passer au solaire commence par de bonnes questions : quels appareils
            alimenter, pendant combien de temps et avec quelle autonomie ?
          </p>
          <p className="pcg-home-about__copy">
            PCG SOLAR accompagne particuliers et professionnels dans le choix
            d'équipements photovoltaïques cohérents avec leurs usages et leur budget.
          </p>

          <div className="pcg-home-about__equipment" aria-label="Types de produits">
            {equipment.map((item) => (
              <div key={item} className="pcg-home-about__equipment-row">
                <span>{item}</span>
                <span aria-hidden="true" className="pcg-home-about__equipment-line" />
              </div>
            ))}
          </div>

          <Link to="/boutique" className="pcg-home-text-link pcg-home-text-link--dark">
            Explorer les équipements <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
