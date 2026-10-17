import { useEffect } from 'react'
import Hero from '../components/hero/Hero'
import WeaveDivider from '../components/WeaveDivider'
import Statement from '../components/Statement'
import Story from '../components/Story'
import Visit from '../components/Visit'
import Delivery from '../components/Delivery'
import Trade from '../components/Trade'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import HomeSwatchBook from '../components/shop/HomeSwatchBook'

const C = { cream: '#FAF4E4', charcoal: '#121212', gold: '#E8B31A', indigo: '#1A4DA0', crimson: '#C41E1E', burgundy: '#6B1E2E', forest: '#0F7A34' }

export const HOME_TITLE = 'Esterica Fabrics | Authentic Kente Cloth by the Metre, Wembley'

export default function Home({ heroRef, ready }) {
  useEffect(() => {
    document.title = HOME_TITLE
  }, [])

  return (
    <>
      <Hero ref={heroRef} ready={ready} />
      <WeaveDivider from={C.charcoal} to={C.charcoal} palette="bold" />
      <Statement />
      {/* Woven in Ghana runs straight into the swatch book: no seam, the colour block simply takes over */}
      <HomeSwatchBook />
      <WeaveDivider from="#0A0A0A" to={C.cream} palette="bold" />
      <Visit />
      <WeaveDivider from={C.cream} to={C.indigo} palette="jewel" />
      <Story />
      <WeaveDivider from={C.indigo} to={C.forest} palette="jewel" />
      <Delivery />
      <WeaveDivider from="#074D21" to={C.crimson} palette="forest" />
      <Trade />
      <WeaveDivider from={C.crimson} to={C.cream} palette="bold" />
      <FAQ />
      <WeaveDivider from={C.cream} to={C.burgundy} />
      <Contact />
      <WeaveDivider from={C.burgundy} to="#0A0A0A" />
    </>
  )
}
