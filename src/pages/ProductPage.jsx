import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import FabricCard from '../components/shop/FabricCard'
import QuantitySelector from '../components/shop/QuantitySelector'
import WeaveDivider from '../components/WeaveDivider'
import { Reveal, BagIcon, TruckIcon, WhatsAppIcon } from '../components/ui'
import { TRADE_MESSAGE } from '../components/Trade'
import { Link } from '../lib/router'
import { useCart } from '../lib/cart'
import { useSmoothScroll } from '../lib/scroll'
import { VIEWS, relatedTo, viewSrc } from '../data/products'
import { SHIPPING, TRADE_MIN, metresLabel, money, nextBand, percent, perMetreLabel, priceLine } from '../lib/pricing'
import { img, whatsappLink } from '../config'

// The homepage hero's curve, shared with the shop.
const EASE = [0.22, 1, 0.36, 1]

// The editorial cover: the cloth edge to edge, a deep scrim rising from the foot, the name set huge.
// On larger screens the close-up views swap the cover itself.
function ProductHero({ product, onScrollCue }) {
  const ref = useRef(null)
  const still = useReducedMotion()
  const [view, setView] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', still ? '0%' : '18%'])

  const show = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease: EASE },
  })

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-ink text-cream" aria-labelledby="product-title">
      <motion.div aria-hidden="true" className="absolute inset-0 -z-10" style={{ y }}>
        <AnimatePresence initial={false}>
          <motion.img
            key={view}
            // The full cloth keeps its natural proportions; the close-ups are cropped to the cover's shape
            src={VIEWS[view].fp ? viewSrc(product.imageId, VIEWS[view], 1600, 1000) : img(product.imageId, 1600)}
            srcSet={[800, 1200, 1600, 2400].map((w) => `${VIEWS[view].fp ? viewSrc(product.imageId, VIEWS[view], w, Math.round(w * 0.625)) : img(product.imageId, w)} ${w}w`).join(', ')}
            sizes="100vw"
            alt=""
            fetchpriority={view === 0 ? 'high' : undefined}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: view === 0 ? 1.08 : 1.04 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: view === 0 ? 2.4 : 1.2, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          />
        </AnimatePresence>
      </motion.div>
      {/* A scrim rising from the foot for the name, and a light one at the top for the header */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.55) 28%, rgba(10,10,10,0.12) 58%, rgba(10,10,10,0.6) 100%)' }}
      />

      <div className="flex h-full flex-col justify-end px-5 pb-56 sm:px-8 md:pb-40 lg:px-12">
        <motion.nav {...show(0)} aria-label="Breadcrumb" className="mb-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-cream/80">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/shop" className="transition-colors hover:text-gold">The Collection</Link></li>
            <li aria-hidden="true" className="text-gold">/</li>
            <li aria-current="page" className="text-cream">{product.name}</li>
          </ol>
        </motion.nav>
        <motion.h1
          id="product-title"
          {...show(0.1)}
          className="font-serif text-[clamp(4rem,13vw,12.5rem)] font-semibold leading-[0.86] tracking-[-0.03em] [text-wrap:balance]"
        >
          {product.name}
        </motion.h1>
        <motion.p {...show(0.26)} className="mt-6 text-[12px] font-semibold uppercase tracking-[0.32em] text-gold md:mt-8 md:text-[13px]">
          {product.weave} · Handpicked Kente from trusted weavers
        </motion.p>
      </div>

      {/* Close-up views of the cloth, from tablet up: top right, clear of the name and the WhatsApp button */}
      <motion.div
        {...show(0.4)}
        role="group"
        aria-label="Views of the cloth"
        className="absolute right-8 top-[108px] hidden flex-col items-end gap-1 rounded-sm bg-ink/55 px-4 py-3 backdrop-blur-md md:flex lg:right-12"
      >
        {VIEWS.map((v, i) => (
          <button
            key={v.label}
            type="button"
            aria-pressed={i === view}
            onClick={() => setView(i)}
            className={`min-h-[32px] text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors ${i === view ? 'text-gold' : 'text-cream/70 hover:text-cream'}`}
          >
            {v.label}
          </button>
        ))}
      </motion.div>

      {/* Scroll cue: large, bright, the arrow bobbing slowly so the eye finds it */}
      <motion.button
        type="button"
        onClick={onScrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 px-4 py-2 text-[13px] font-bold uppercase tracking-[0.34em] text-cream transition-colors hover:text-gold max-md:bottom-24"
        aria-label="Scroll to the details"
      >
        <span aria-hidden="true">Scroll</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="scroll-bounce h-9 w-9 text-gold" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v15M5 12l7 7 7-7" />
        </svg>
      </motion.button>
    </section>
  )
}

// The order message for this cloth and length, shared by the panel and the phone bar.
function orderText(product, metres) {
  const price = priceLine(product.perMetre, metres)
  return `Hi Esterica Fabrics, I'd like to order ${metresLabel(metres)} of ${product.name} (${product.tierLabel}, ${perMetreLabel(product.perMetre)} per metre). The website shows ${money(price.total)}${
    price.discount ? ` after the ${percent(price.rate)} bulk discount` : ''
  }. Is it available?`
}
const tradeText = (product, metres) => TRADE_MESSAGE.replace('Fabric(s):', `Fabric(s): ${product.name}`).replace('Metres:', `Metres: ${metres}`)

// Phones only: the buying bar that takes the place of the site's usual bottom bar on a product page.
// It hides while the panel's own buttons are on screen, so the two never show at once.
function BuyBar({ product, metres, hidden }) {
  const { add } = useCart()
  const isTrade = metres >= TRADE_MIN
  const price = priceLine(product.perMetre, metres)
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-charcoal/95 text-cream backdrop-blur-md md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <p className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-serif text-[1.05rem] font-semibold">{product.name}</span>
              <span className="text-[12px] text-cream/75">
                {metresLabel(metres)} · <span className="font-semibold text-gold">{isTrade ? 'trade price' : money(price.total)}</span>
              </span>
            </p>
            {isTrade ? (
              <a href={whatsappLink(tradeText(product, metres))} target="_blank" rel="noopener noreferrer" className="btn-gold !min-h-[48px] !px-4 !text-[12px]">
                <WhatsAppIcon className="h-[18px] w-[18px]" /> Trade price
              </a>
            ) : (
              <>
                <a
                  href={whatsappLink(orderText(product, metres))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Order ${metresLabel(metres)} of ${product.name} via WhatsApp`}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-[3px] border border-cream/40 text-cream"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
                <button type="button" onClick={() => add(product.slug, metres)} className="btn-gold !min-h-[48px] !px-4 !text-[12px]">
                  <BagIcon className="h-[18px] w-[18px]" /> Add to Cart
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Purchase({ product, metres, setMetres, actionsRef }) {
  const { add } = useCart()
  const isTrade = metres >= TRADE_MIN
  const price = priceLine(product.perMetre, metres)
  const next = nextBand(metres)

  const enter = (delay) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <div className="bg-charcoal p-6 text-cream sm:p-8 md:p-10 lg:sticky lg:top-28">
      <motion.p {...enter(0)} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/70">
        {product.tierLabel} · Sold by the metre
      </motion.p>
      <motion.p {...enter(0.08)} className="mt-4 flex items-baseline gap-3">
        <span className="font-serif text-[clamp(3.6rem,6vw,5rem)] font-semibold leading-none text-gold">{perMetreLabel(product.perMetre)}</span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.24em] text-cream/70">per metre</span>
      </motion.p>

      <motion.div {...enter(0.16)} className="mt-9">
        <QuantitySelector value={metres} onChange={setMetres} dark />
      </motion.div>

      <motion.div {...enter(0.24)} className="mt-8 border-t border-cream/15 pt-6" aria-live="polite">
        {isTrade ? (
          <>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-gold">Trade order</p>
            <p className="mt-2 text-[15px] leading-relaxed text-cream/85">
              {metresLabel(metres)} is a trade sized order. Orders of {TRADE_MIN} metres or more are priced individually, so message us for a trade price.
            </p>
          </>
        ) : (
          <dl className="grid gap-2 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-cream/75">{metresLabel(metres)} × {perMetreLabel(product.perMetre)}</dt>
              <dd>{money(price.gross)}</dd>
            </div>
            {price.discount > 0 && (
              <div className="flex justify-between gap-4 text-[#4FD97E]">
                <dt>Bulk discount {percent(price.rate)}</dt>
                <dd>-{money(price.discount)}</dd>
              </div>
            )}
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-gold">Total</dt>
              <dd className="font-serif text-[2.4rem] font-semibold leading-none">{money(price.total)}</dd>
            </div>
            {next && (
              <p className="mt-1 text-[13px] text-gold-light">
                Buy {metresLabel(next.min)} or more and save {percent(next.rate)}.
              </p>
            )}
          </dl>
        )}
      </motion.div>

      <motion.div ref={actionsRef} {...enter(0.32)} className="mt-7 grid gap-3">
        {isTrade ? (
          <a href={whatsappLink(tradeText(product, metres))} target="_blank" rel="noopener noreferrer" className="btn-gold min-h-[60px]">
            <WhatsAppIcon /> Enquire for trade pricing
          </a>
        ) : (
          <>
            <button type="button" onClick={() => add(product.slug, metres)} className="btn-gold min-h-[60px] text-[15px]">
              <BagIcon /> Add to Cart
            </button>
            <a href={whatsappLink(orderText(product, metres))} target="_blank" rel="noopener noreferrer" className="btn-outline-light min-h-[56px]">
              <WhatsAppIcon /> Order via WhatsApp
            </a>
          </>
        )}
      </motion.div>

      <p className="mt-6 flex items-start gap-3 text-[13px] leading-relaxed text-cream/70">
        <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <span>
          UK delivery in {SHIPPING.standard.eta}, {money(SHIPPING.standard.price)} or free over £75. Free Click & Collect from Wembley.
        </span>
      </p>
    </div>
  )
}

function CompleteTheLook({ product }) {
  const rail = useRef(null)
  const items = relatedTo(product, 6)
  const nudge = (d) => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.8, behavior: 'smooth' })
  const arrow = 'grid h-12 w-12 place-items-center rounded-full border border-charcoal/30 text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-gold'

  return (
    <section className="bg-cream pb-24 pt-20 md:pb-32 md:pt-28" aria-labelledby="look-title">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <h2 id="look-title" className="font-serif text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.01em] text-charcoal">
              Complete the look
            </h2>
            <p className="accent mt-4 max-w-xl text-[1.35rem] leading-snug text-charcoal/80 md:text-[1.6rem]">
              Inspired by tailors, designers, and lovers of African heritage.
            </p>
          </Reveal>
          <div className="hidden shrink-0 gap-3 md:flex">
            <button type="button" className={arrow} onClick={() => nudge(-1)} aria-label="Previous fabrics">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" className={arrow} onClick={() => nudge(1)} aria-label="More fabrics">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={rail}
        className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto scroll-smooth px-5 pb-6 sm:scroll-px-8 lg:scroll-px-12 [scrollbar-width:none] sm:px-8 md:mt-16 md:gap-10 lg:px-12 [&::-webkit-scrollbar]:hidden"
        aria-label="Related fabrics"
      >
        {items.map((p, i) => (
          <motion.li
            key={p.slug}
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] md:w-[36vw] lg:w-[27vw]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: i * 0.06, ease: EASE }}
          >
            <FabricCard product={p} index={i} sizes="(min-width: 1024px) 27vw, (min-width: 768px) 36vw, 78vw" />
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

export default function ProductPage({ product }) {
  const { scrollTo } = useSmoothScroll()
  const [metres, setMetres] = useState(2)
  const actionsRef = useRef(null)
  const [actionsOnScreen, setActionsOnScreen] = useState(false)

  // The phone buying bar steps aside whenever the panel's own Add to Cart is in view.
  useEffect(() => {
    const el = actionsRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActionsOnScreen(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.title = `${product.name}, ${product.tierLabel} by the Metre | Esterica Fabrics`
  }, [product])

  const details = [
    ['Weave', product.weave],
    ['Origin', product.origin],
    ['Pattern', product.patterns.join(', ')],
    ['Colours', product.colours.join(', ')],
    ['Best for', product.occasions.join(', ')],
    ['Cut', 'To your length, in half metres'],
    ['Care', 'Dry clean, or hand wash cold. Iron on the reverse.'],
  ]

  return (
    <>
      <ProductHero product={product} onScrollCue={() => scrollTo(document.getElementById('details'))} />

      {/* The details follow the cover straight away: on phones the price and buttons come first */}
      <section id="details" className="bg-cream pb-20 pt-10 md:pb-32 md:pt-20" aria-label="Details and price">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-20 lg:px-12">
          <div className="lg:col-span-6 xl:col-span-7">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/65">About the cloth</p>
              <p className="mt-6 font-serif text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.3] text-charcoal">{product.blurb}</p>
            </Reveal>
            <dl className="mt-12 border-t border-charcoal/15 md:mt-16">
              {details.map(([k, v], i) => (
                <Reveal key={k} delay={i * 0.06} y={20} className="grid gap-1 border-b border-charcoal/15 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal/65 sm:pt-1">{k}</dt>
                  <dd className="text-[16px] leading-relaxed text-charcoal/90">{v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>

          {/* Stacked on phones and tablets, the price comes first; side by side, it sits on the right */}
          <div className="max-lg:order-first lg:col-span-6 xl:col-span-5">
            <Purchase product={product} metres={metres} setMetres={setMetres} actionsRef={actionsRef} />
          </div>
        </div>
      </section>

      <WeaveDivider from="#FAF4E4" to="#FAF4E4" palette="bold" />
      <CompleteTheLook product={product} />
      <WeaveDivider from="#FAF4E4" to="#0A0A0A" palette="bold" />
      <BuyBar product={product} metres={metres} hidden={actionsOnScreen} />
    </>
  )
}
