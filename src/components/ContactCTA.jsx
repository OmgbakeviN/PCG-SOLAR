import { ArrowUpRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { media } from '../data/siteData'

export default function ContactCTA() {
  return (
    <section id="contact" className="pcg-home-contact" aria-labelledby="pcg-contact-title">
      <div className="pcg-home-contact__main">
        <div className="pcg-home-contact__content">
          <div className="pcg-home-contact__copy">
            <p className="pcg-home-kicker pcg-home-kicker--light">Parlons de votre installation</p>
            <h2 id="pcg-contact-title" className="pcg-home-display pcg-home-section-title">
              Un projet solaire commence par une conversation.
            </h2>
            <p>
              Dites-nous ce que vous souhaitez alimenter. Nous vous aiderons
              à identifier les équipements à considérer.
            </p>
            <div className="pcg-home-contact__actions">
              <a href="mailto:contact@pcgsolar.com?subject=Projet%20solaire%20PCG%20SOLAR" className="pcg-home-button pcg-home-button--solar">
                <Mail aria-hidden="true" size={18} /> Nous écrire
              </a>
              <Link to="/boutique" className="pcg-home-text-link pcg-home-text-link--light">
                Découvrir la boutique <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
        </div>
        <div className="pcg-home-contact__photo">
          <img
            src={media.engineer}
            alt="Professionnel intervenant sur un équipement énergétique"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
