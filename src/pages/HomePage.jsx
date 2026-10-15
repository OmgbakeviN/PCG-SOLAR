import Hero from '../components/Hero'
import HomeAbout from '../components/HomeAbout'
import FeaturedProducts from '../components/FeaturedProducts'
import ContactCTA from '../components/ContactCTA'

/**
 * Homepage PCG SOLAR — une page volontairement courte.
 * La boutique, l'auth et le back-office restent hors de ce composant.
 */
export default function HomePage() {
  return (
    <main className="pcg-home" id="main-content">
      <Hero />
      <HomeAbout />
      <FeaturedProducts />
      <ContactCTA />
    </main>
  )
}
