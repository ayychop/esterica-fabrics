import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { SmoothScrollProvider, usePastElement, useSmoothScroll } from './lib/scroll'
import { ConsentProvider } from './lib/consent'
import IntroLoader, { introAlreadyPlayed } from './components/IntroLoader'
import Header from './components/Header'
import Hero from './components/hero/Hero'
import WeaveDivider from './components/WeaveDivider'
import Collection from './components/Collection'
import Statement from './components/Statement'
import Story from './components/Story'
import HowToOrder from './components/HowToOrder'
import Visit from './components/Visit'
import Delivery from './components/Delivery'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { BackToTop, CookieBanner, LegalModal, WhatsAppOrb } from './components/Overlays'
import { NAV_LINKS } from './config'

const SECTION_IDS = ['top', ...NAV_LINKS.map((l) => l.id)]

// Which section sits in the middle band of the viewport, for the header highlight.
function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

// True once the section with this id has fully scrolled out above the viewport.
function usePastSection(id) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const el = document.getElementById(id)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [id])
  return past
}

function useIsPhone() {
  const query = '(max-width: 767px)'
  const [phone, setPhone] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setPhone(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return phone
}

const C = { cream: '#FAF4E4', charcoal: '#121212', gold: '#E8B31A', indigo: '#1A4DA0', crimson: '#C41E1E', burgundy: '#6B1E2E', forest: '#0F7A34' }

function Site() {
  const topSentinel = useRef(null)
  const heroRef = useRef(null)
  const scrolled = usePastElement(topSentinel)
  const pastHero = usePastElement(heroRef, '-120px 0px 0px 0px')
  const [legal, setLegal] = useState(null)
  const closeLegal = useCallback(() => setLegal(null), [])
  const { stop, start } = useSmoothScroll()
  const active = useActiveSection(SECTION_IDS)
  // On phones only the WhatsApp orb floats over the content until the FAQ is behind you,
  // so the two buttons together never cover the steps in How to Order.
  const isPhone = useIsPhone()
  const pastFaq = usePastSection('faq')
  const showBackToTop = isPhone ? pastFaq : pastHero

  const [intro, setIntro] = useState(() => !introAlreadyPlayed())
  const [revealed, setRevealed] = useState(() => introAlreadyPlayed())

  useEffect(() => {
    if (revealed) return
    window.scrollTo(0, 0)
    document.documentElement.style.overflow = 'hidden'
    stop()
    return () => {
      document.documentElement.style.overflow = ''
      start()
    }
  }, [revealed])

  const onReveal = useCallback(() => setRevealed(true), [])
  const onIntroDone = useCallback(() => setIntro(false), [])

  return (
    <>
      {intro && <IntroLoader onReveal={onReveal} onDone={onIntroDone} />}
      <div ref={topSentinel} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-10 w-px" />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header solid={scrolled} activeId={active} />

      <main id="main">
        <Hero ref={heroRef} ready={revealed} />
        <WeaveDivider from={C.charcoal} to={C.cream} />
        <Collection />
        <WeaveDivider from={C.cream} to={C.charcoal} />
        <Statement />
        <WeaveDivider from={C.charcoal} to={C.gold} palette="bold" />
        <HowToOrder />
        <WeaveDivider from={C.gold} to={C.cream} palette="bold" />
        <Visit />
        <WeaveDivider from={C.cream} to={C.indigo} palette="jewel" />
        <Story />
        <WeaveDivider from={C.indigo} to={C.forest} palette="jewel" />
        <Delivery />
        <WeaveDivider from="#074D21" to={C.cream} palette="forest" />
        <FAQ />
        <WeaveDivider from={C.cream} to={C.burgundy} />
        <Contact />
        <WeaveDivider from={C.burgundy} to="#0A0A0A" />
      </main>
      <Footer onLegal={setLegal} />

      <WhatsAppOrb />
      <BackToTop visible={showBackToTop} />
      <CookieBanner />
      <LegalModal which={legal} onClose={closeLegal} />
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ConsentProvider>
        <SmoothScrollProvider>
          <Site />
        </SmoothScrollProvider>
      </ConsentProvider>
    </MotionConfig>
  )
}
