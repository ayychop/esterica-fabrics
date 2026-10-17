import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Stepper } from './QuantitySelector'
import { ArrowIcon, BagIcon, WhatsAppIcon } from '../ui'
import { Link } from '../../lib/router'
import { useCart } from '../../lib/cart'
import { TONES } from '../../data/products'
import { MAX_CART_METRES, metresLabel, perMetreLabel } from '../../lib/pricing'
import { img, whatsappLink } from '../../config'

const EASE = [0.22, 1, 0.36, 1]
const pad = (n) => String(n).padStart(2, '0')

// The swatch book: one cloth at a time, as if turning the pages of a physical sample book.
// The photograph fills the left, the details breathe on the right, and the whole stage takes on the
// cloth's own Kente colour. A tray of swatches floats along the foot; on phones the photo also swipes.
export default function SwatchBook({ products, id, browse, empty }) {
  const [slug, setSlug] = useState(products[0]?.slug)
  const [metres, setMetres] = useState(2)
  const { add } = useCart()
  const trayRef = useRef(null)

  // If the filters take away the cloth on show, open the book at the first one that remains.
  const index = Math.max(0, products.findIndex((p) => p.slug === slug))
  const current = products[index]
  useEffect(() => {
    if (current && current.slug !== slug) setSlug(current.slug)
  }, [current, slug])

  const go = (i) => {
    const next = products[(i + products.length) % products.length]
    if (!next) return
    setSlug(next.slug)
    // keep the chosen swatch in view inside the tray, without moving the page
    const btn = trayRef.current?.querySelector(`[data-slug="${next.slug}"]`)
    if (btn && trayRef.current) {
      const tray = trayRef.current
      tray.scrollTo({ left: btn.offsetLeft - tray.clientWidth / 2 + btn.clientWidth / 2, behavior: 'smooth' })
    }
  }

  if (!current) {
    return (
      <section id={id} aria-label="Swatch book" className="grid min-h-[70svh] place-items-center bg-charcoal px-6 py-24 text-center text-cream">
        <div>
          <p className="mx-auto max-w-xl font-serif text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-tight [text-wrap:balance]">No fabrics match this combination.</p>
          <p className="mt-4 text-[16px] text-cream/75">Try adjusting your filters.</p>
          {empty}
        </div>
      </section>
    )
  }

  const tone = TONES[current.tone] ?? TONES.charcoal
  const onLight = tone.fg === '#0A0A0A'
  const wa = `Hi Esterica Fabrics, I'd like to order ${metresLabel(metres)} of ${current.name} (${current.tierLabel}, ${perMetreLabel(current.perMetre)} per metre). Is it available?`

  return (
    <section
      id={id}
      aria-label="Swatch book"
      aria-roledescription="carousel"
      className="relative transition-[background-color,color] duration-[900ms] ease-out lg:grid lg:min-h-[max(calc(100svh-76px),640px)] lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)]"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {/* The cloth. Drag sideways to turn the page. */}
      <motion.div
        className="relative h-[56svh] min-h-[340px] cursor-grab touch-pan-y overflow-hidden bg-ink active:cursor-grabbing lg:h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(index + 1)
          else if (info.offset.x > 60) go(index - 1)
        }}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={current.slug}
            src={img(current.imageId, 1400, 1600)}
            srcSet={[700, 1000, 1400, 2000].map((w) => `${img(current.imageId, w, Math.round(w * 1.15))} ${w}w`).join(', ')}
            sizes="(min-width: 1024px) 58vw, 100vw"
            alt={`${current.name}, ${current.weave}`}
            draggable={false}
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE } }}
          />
        </AnimatePresence>
      </motion.div>

      {/* The page of the swatch book: lots of air, one cloth, one price */}
      <div className="relative flex flex-col px-6 pb-12 pt-8 sm:px-10 lg:px-14 lg:pb-32 lg:pt-12 xl:px-20">
        <div className="flex items-baseline justify-between gap-6 text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: tone.fg }}>
          <p aria-live="polite">
            <span className="opacity-70 max-sm:hidden">The Collection</span>
            <span className="whitespace-nowrap tabular-nums sm:ml-3">{pad(index + 1)} / {pad(products.length)}</span>
          </p>
          {browse && (
            <button type="button" onClick={browse} className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap border-b border-current pb-0.5 uppercase transition-opacity hover:opacity-70">
              Browse all <ArrowIcon className="h-3.5 w-3.5 rotate-90" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.slug}
            className="flex flex-1 flex-col justify-center pt-8 lg:pt-0"
            initial="out"
            animate="in"
            exit="gone"
            variants={{ in: { transition: { staggerChildren: 0.07 } } }}
          >
            {[
              <p key="weave" className="text-[12px] font-semibold uppercase tracking-[0.3em] opacity-75">
                {current.weave} · {current.tierLabel}
              </p>,
              <h2 key="name" className="mt-5 font-serif text-[clamp(3rem,5.6vw,6.75rem)] font-semibold leading-[0.9] tracking-[-0.02em] [text-wrap:balance]">
                {current.name}
              </h2>,
              <p key="blurb" className="mt-7 max-w-md text-[16px] leading-[1.75] opacity-85 md:text-[17px]">
                {current.blurb}
              </p>,
              <p key="price" className="mt-9 flex items-baseline gap-3">
                <span className="font-serif text-[clamp(2.4rem,3.4vw,3.4rem)] font-semibold leading-none" style={{ color: tone.accent }}>
                  {perMetreLabel(current.perMetre)}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.26em] opacity-75">per metre</span>
              </p>,
              <div key="actions" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Stepper value={metres} onChange={setMetres} max={MAX_CART_METRES} label={`Metres of ${current.name}`} dark={!onLight} />
                <button type="button" onClick={() => add(current.slug, metres)} className={`btn min-h-[52px] ${tone.button}`}>
                  <BagIcon className="h-[18px] w-[18px]" /> Add to Cart
                </button>
                <a href={whatsappLink(wa)} target="_blank" rel="noopener noreferrer" className={`btn min-h-[52px] border ${tone.outline}`}>
                  <WhatsAppIcon className="h-[18px] w-[18px]" /> Order via WhatsApp
                </a>
              </div>,
              <Link key="more" to={`/shop/${current.slug}`} className="mt-7 inline-flex min-h-[44px] items-center gap-2 self-start text-[12px] font-semibold uppercase tracking-[0.24em] underline underline-offset-[6px] transition-opacity hover:opacity-70">
                See the whole cloth <ArrowIcon className="h-3.5 w-3.5" />
              </Link>,
            ].map((child) => (
              <motion.div
                key={child.key}
                variants={{ out: { opacity: 0, y: 18 }, in: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }, gone: { opacity: 0, transition: { duration: 0.2 } } }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The swatch tray. Phones: along the foot of the photo. Desktop: centred across the whole stage. */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(max(56svh,340px)-84px)] z-10 flex justify-center px-4 lg:bottom-7 lg:top-auto">
        <div
          ref={trayRef}
          role="group"
          aria-label="Choose a cloth"
          onKeyDown={(e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
            e.preventDefault()
            const next = index + (e.key === 'ArrowRight' ? 1 : -1)
            go(next)
            requestAnimationFrame(() => trayRef.current?.querySelector(`[data-slug="${products[(next + products.length) % products.length].slug}"]`)?.focus())
          }}
          className="pointer-events-auto flex max-w-full gap-3 overflow-x-auto rounded-full border border-cream/20 bg-ink/45 px-3 py-2.5 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => {
            const on = p.slug === current.slug
            return (
              <button
                key={p.slug}
                type="button"
                data-slug={p.slug}
                aria-label={p.name}
                aria-pressed={on}
                tabIndex={on ? 0 : -1}
                onClick={() => go(products.indexOf(p))}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full transition-[transform,box-shadow,opacity] duration-500 md:h-14 md:w-14 ${
                  on ? 'scale-105 opacity-100 shadow-[0_0_0_2px_#FAF4E4,0_0_0_4px_rgba(10,10,10,0.5)]' : 'opacity-70 hover:scale-105 hover:opacity-100'
                }`}
              >
                <img src={img(p.imageId, 120, 120)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: (TONES[p.tone] ?? TONES.charcoal).bg }} />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
