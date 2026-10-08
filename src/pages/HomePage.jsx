import Hero from '../components/Hero'
import HomeAbout from '../components/HomeAbout'
import FeaturedProducts from '../components/FeaturedProducts'
import HomeMission from '../components/HomeMission'
import HomeValues from '../components/HomeValues'
import ContactCTA from '../components/ContactCTA'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HomeAbout />
      <FeaturedProducts />
      <HomeMission />
      <HomeValues />
      <ContactCTA />
    </main>
  )
}
