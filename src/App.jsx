import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { SmoothScrollProvider, usePastElement, useSmoothScroll } from './lib/scroll'
import { ConsentProvider } from './lib/consent'
import { CartProvider } from './lib/cart'
import { ProductsProvider, useProducts } from './lib/products'
import { RouterProvider, matchRoute, useRouter } from './lib/router'
import IntroLoader, { shouldPlayIntro } from './components/IntroLoader'
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
import SuccessPage from './pages/SuccessPage'
import NotFoundPage from './pages/NotFoundPage'

// The admin portal is its own bundle, so shoppers never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))
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

// Pages that cannot draw without the catalogue wait for it, or say why it did not come.
const NEEDS_CATALOGUE = ['shop', 'product', 'cart', 'checkout']

function CatalogueState({ status, error, reload }) {
  return (
    <section className="grid min-h-[80svh] place-items-center bg-ink px-6 pt-24 text-center text-cream" aria-live="polite">
      {status === 'error' ? (
        <div className="max-w-lg">
          <p className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold leading-tight">We could not load the collection.</p>
          <p className="mt-4 break-words text-[14px] text-cream/70">{error}</p>
          <button type="button" onClick={reload} className="btn-gold mt-8">Try again</button>
        </div>
      ) : (
        <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-gold">Loading the collection</p>
      )}
    </section>
  )
}

function Page({ route, heroRef, revealed, introOver }) {
  const { status, error, reload, bySlug } = useProducts()
  if (NEEDS_CATALOGUE.includes(route.name) && status !== 'ready') return <CatalogueState status={status} error={error} reload={reload} />
  switch (route.name) {
    case 'home':
      return <Home heroRef={heroRef} ready={revealed} cloth={introOver} />
    case 'shop':
      return <ShopPage />
    case 'product': {
      const product = bySlug(route.slug)
      return product ? <ProductPage key={product.slug} product={product} /> : <NotFoundPage title="Fabric not found" />
    }
    case 'cart':
      return <CartPage />
    case 'checkout':
      return <CheckoutPage />
    case 'confirmed':
      return <ConfirmationPage />
    case 'success':
      return <SuccessPage />
    default:
      return <NotFoundPage />
  }
}

function Site() {
  const { location } = useRouter()
  const route = matchRoute(location.path)
  const { bySlug } = useProducts()
  const productOpen = route.name === 'product' && Boolean(bySlug(route.slug))
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

  // The intro plays once per browser session, only when the visit starts on the home page,
  // and never for visitors who ask for reduced motion.
  const [intro, setIntro] = useState(() => isHome && shouldPlayIntro())
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
      {/* Tall, so it starts on screen: a fast fling past it still registers, which a 1px marker below the fold would not. */}
      {longPage && <div id="fold" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-[140vh] w-px" />}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      {/* Home and product pages open on a full-bleed image, so the header sits clear over it until you scroll */}
      <Header solid={scrolled || !(isHome || productOpen)} home={isHome} activeId={isHome ? active : route.name === 'shop' || route.name === 'product' ? 'shop' : null} />

      <main id="main">
        <Page route={route} heroRef={heroRef} revealed={revealed} introOver={!intro} />
      </main>
      <Footer onLegal={setLegal} />

      <CartToast />
      <WhatsAppOrb />
      {/* On a product page the phone bottom bar gives way to that page's own buying bar */}
      {!productOpen && <MobileBar showTop={showBackToTop} />}
      <BackToTop visible={showBackToTop} />
      <CookieBanner />
      <LegalModal which={legal} onClose={closeLegal} />
    </>
  )
}

function Shop() {
  return (
    <ProductsProvider>
      <CartProvider>
        <SmoothScrollProvider>
          <Site />
        </SmoothScrollProvider>
      </CartProvider>
    </ProductsProvider>
  )
}

// /admin has none of the shop around it: no header, cart or WhatsApp button.
function Root() {
  const { location } = useRouter()
  const route = matchRoute(location.path)
  if (!route.name.startsWith('admin')) return <Shop />
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <AdminApp route={route} />
    </Suspense>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider>
        <ConsentProvider>
          <Root />
        </ConsentProvider>
      </RouterProvider>
    </MotionConfig>
  )
}
