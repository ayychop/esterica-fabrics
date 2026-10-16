import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { SmoothScrollProvider, usePastElement, useSmoothScroll } from './lib/scroll'
import { ConsentProvider } from './lib/consent'
import { CartProvider } from './lib/cart'
import { RouterProvider, matchRoute, useRouter } from './lib/router'
import IntroLoader, { introAlreadyPlayed } from './components/IntroLoader'
import Header from './components/Header'
import Footer from './components/Footer'
import CartToast from './components/shop/CartToast'
import MobileBar from './components/shop/MobileBar'
import { BackToTop, CookieBanner, LegalModal, WhatsAppOrb } from './components/Overlays'
import Home from './pages/Home'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import NotFoundPage from './pages/NotFoundPage'
import { productBySlug } from './data/products'
import { NAV_LINKS } from './config'

const SECTION_IDS = ['top', ...NAV_LINKS.filter((l) => !l.to).map((l) => l.id)]

// Which section sits in the middle band of the viewport, for the header highlight.
// `on` re-runs the observers whenever the home page mounts again.
function useActiveSection(ids, on) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    if (!on) return setActive(null)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids, on])
  return active
}

// True once the element with this id has fully scrolled out above the viewport.
function usePastSection(id, on, rootMargin = '0px') {
  const [past, setPast] = useState(false)
  useEffect(() => {
    setPast(false)
    const el = on && document.getElementById(id)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [id, on, rootMargin])
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

function Page({ route, heroRef, revealed }) {
  switch (route.name) {
    case 'home':
      return <Home heroRef={heroRef} ready={revealed} />
    case 'shop':
      return <ShopPage />
    case 'product': {
      const product = productBySlug(route.slug)
      return product ? <ProductPage key={product.slug} product={product} /> : <NotFoundPage title="Fabric not found" />
    }
    case 'cart':
      return <CartPage />
    case 'checkout':
      return <CheckoutPage />
    case 'confirmed':
      return <ConfirmationPage />
    default:
      return <NotFoundPage />
  }
}

function Site() {
  const { location } = useRouter()
  const route = matchRoute(location.path)
  const isHome = route.name === 'home'
  const longPage = route.name === 'shop' || route.name === 'product'

  const topSentinel = useRef(null)
  const heroRef = useRef(null)
  const scrolled = usePastElement(topSentinel)
  const [legal, setLegal] = useState(null)
  const closeLegal = useCallback(() => setLegal(null), [])
  const { stop, start, jump } = useSmoothScroll()
  const active = useActiveSection(SECTION_IDS, isHome)
  // On phones only the WhatsApp orb floats over the content until the FAQ is behind you,
  // so the two buttons together never cover the steps in How to Order.
  const isPhone = useIsPhone()
  const pastHero = usePastSection('top', isHome, '-120px 0px 0px 0px')
  const pastFaq = usePastSection('faq', isHome)
  const pastFold = usePastSection('fold', longPage)
  const showBackToTop = isHome ? (isPhone ? pastFaq : pastHero) : pastFold

  // The intro plays once per visit, and only when the visit starts on the home page.
  const [intro, setIntro] = useState(() => isHome && !introAlreadyPlayed())
  const [revealed, setRevealed] = useState(() => !intro)

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

  // After each page change: back to the remembered spot, the #section asked for, or the top.
  const firstRender = useRef(true)
  useEffect(() => {
    const first = firstRender.current
    firstRender.current = false
    if ((first && !location.hash) || !revealed) return
    const target = location.hash && document.getElementById(location.hash)
    jump(target || location.scroll)
  }, [location])

  const onReveal = useCallback(() => setRevealed(true), [])
  const onIntroDone = useCallback(() => setIntro(false), [])

  return (
    <>
      {intro && <IntroLoader onReveal={onReveal} onDone={onIntroDone} />}
      <div ref={topSentinel} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-10 w-px" />
      {longPage && <div id="fold" aria-hidden="true" className="pointer-events-none absolute left-0 top-[140vh] h-px w-px" />}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header solid={scrolled || !isHome} home={isHome} activeId={isHome ? active : route.name === 'shop' || route.name === 'product' ? 'shop' : null} />

      <main id="main">
        <Page route={route} heroRef={heroRef} revealed={revealed} />
      </main>
      <Footer onLegal={setLegal} />

      <CartToast />
      <WhatsAppOrb />
      <MobileBar />
      <BackToTop visible={showBackToTop} />
      <CookieBanner />
      <LegalModal which={legal} onClose={closeLegal} />
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider>
        <ConsentProvider>
          <CartProvider>
            <SmoothScrollProvider>
              <Site />
            </SmoothScrollProvider>
          </CartProvider>
        </ConsentProvider>
      </RouterProvider>
    </MotionConfig>
  )
}
