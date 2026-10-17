import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import FabricCard from '../components/shop/FabricCard'
import WeaveDivider from '../components/WeaveDivider'
import Trade from '../components/Trade'
import { COLOURS, OCCASIONS, PATTERNS, PRODUCTS } from '../data/products'
import { img } from '../config'

// The homepage hero's curve, so the shop moves like the cloth that brought you here.
const EASE = [0.22, 1, 0.36, 1]
const HERO_IMAGE = '1552710307-537199cd41c0'

const SORTS = {
  newest: { label: 'Newest', fn: (a, b) => b.added.localeCompare(a.added) },
  'price-asc': { label: 'Price, low to high', fn: (a, b) => a.perMetre - b.perMetre || a.name.localeCompare(b.name) },
  'price-desc': { label: 'Price, high to low', fn: (a, b) => b.perMetre - a.perMetre || a.name.localeCompare(b.name) },
}

const GROUPS = [
  { key: 'occasion', legend: 'Occasion', options: OCCASIONS },
  { key: 'colour', legend: 'Colour', options: COLOURS, swatches: true },
  { key: 'pattern', legend: 'Pattern', options: PATTERNS },
]

const EMPTY = { occasion: null, colour: null, pattern: null }

const labelOf = (opt) => (typeof opt === 'string' ? opt : opt.label)

// Kept outside the component, so filters survive a visit to a product and back.
let saved = { filters: EMPTY, sort: 'newest' }

function ChipGroup({ legend, options, value, onChange, swatches }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-charcoal/70">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {Object.entries(options).map(([key, opt]) => {
          const on = value === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? null : key)}
              className={`inline-flex min-h-[40px] items-center gap-2 border px-3 text-[13px] font-semibold transition-colors ${
                on ? 'border-charcoal bg-charcoal text-gold' : 'border-charcoal/25 text-charcoal hover:border-charcoal'
              }`}
            >
              {swatches && <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full ring-1 ring-cream/60" style={{ background: opt.hex }} />}
              {labelOf(opt)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function ShopHero() {
  const ref = useRef(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // The cloth falls away a little slower than the page as you scroll into the collection.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', still ? '0%' : '18%'])

  const show = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease: EASE },
  })

  return (
    <section ref={ref} className="relative isolate h-[88svh] min-h-[540px] overflow-hidden bg-ink text-cream" aria-labelledby="shop-title">
      <motion.div aria-hidden="true" className="absolute inset-0 -z-10" style={{ y }}>
        <motion.img
          src={img(HERO_IMAGE, 1600)}
          srcSet={[800, 1200, 1600, 2400].map((w) => `${img(HERO_IMAGE, w)} ${w}w`).join(', ')}
          sizes="100vw"
          alt=""
          fetchpriority="high"
          decoding="async"
          className="h-full w-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        />
      </motion.div>
      {/* One flat veil, no fade: just enough to lift the cream type off the busy cloth */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/50" />

      <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-14 sm:px-8 md:pb-20 lg:px-12">
        <motion.h1
          id="shop-title"
          {...show(0.1)}
          className="heading-depth-dark font-serif text-[clamp(3.6rem,11vw,10rem)] font-semibold leading-[0.88] tracking-[-0.02em]"
        >
          The Collection
        </motion.h1>
        <motion.p {...show(0.28)} className="accent mt-5 max-w-xl text-[clamp(1.35rem,2.4vw,2rem)] leading-snug text-cream [text-wrap:balance] md:mt-7">
          Every cloth tells a story. Every metre is unique.
        </motion.p>
      </div>
    </section>
  )
}

export default function ShopPage() {
  const [filters, setFilters] = useState(saved.filters)
  const [sort, setSort] = useState(saved.sort)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    saved = { filters, sort }
  }, [filters, sort])

  useEffect(() => {
    document.title = 'Shop Kente by the Metre | Esterica Fabrics'
  }, [])

  const results = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (!filters.occasion || p.occasions.includes(filters.occasion)) &&
          (!filters.colour || p.colours.includes(filters.colour)) &&
          (!filters.pattern || p.pattern === filters.pattern),
      ).sort(SORTS[sort].fn),
    [filters, sort],
  )

  const active = GROUPS.filter((g) => filters[g.key])
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }))
  const count = `${results.length} ${results.length === 1 ? 'fabric' : 'fabrics'}`

  return (
    <>
      <ShopHero />

      <section className="bg-cream pb-24 md:pb-40" aria-label="Fabrics">
        {/* Filters and sort live in one slim bar that follows you down the collection */}
        <div className="sticky top-16 z-30 border-b border-charcoal/15 bg-cream md:top-[76px]">
          <div className="mx-auto flex min-h-[64px] max-w-[1600px] items-center gap-3 px-5 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              aria-controls="shop-filters"
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-crimson"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filter
              {active.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[11px] tracking-normal text-cream">{active.length}</span>}
            </button>

            <ul className="hidden min-w-0 flex-1 flex-wrap gap-2 md:flex" aria-label="Active filters">
              {active.map((g) => (
                <li key={g.key}>
                  <button
                    type="button"
                    onClick={() => set(g.key)(null)}
                    className="inline-flex min-h-[32px] items-center gap-2 bg-charcoal px-3 text-[12px] font-semibold text-gold transition-colors hover:bg-crimson hover:text-cream"
                    aria-label={`Remove filter: ${labelOf(g.options[filters[g.key]])}`}
                  >
                    {labelOf(g.options[filters[g.key]])}
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="ml-auto shrink-0 text-[12px] font-semibold uppercase tracking-[0.2em] text-charcoal/65 max-sm:hidden" aria-live="polite">
              {count}
            </p>
            <label className="flex shrink-0 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-charcoal max-sm:ml-auto">
              <span className="max-sm:sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="min-h-[44px] cursor-pointer border-0 border-b border-charcoal/30 bg-transparent pr-1 text-[14px] font-semibold normal-case tracking-normal text-charcoal focus:border-gold focus:outline-none"
              >
                {Object.entries(SORTS).map(([k, s]) => (
                  <option key={k} value={k}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                id="shop-filters"
                data-lenis-prevent
                className="max-h-[70vh] overflow-y-auto border-t border-charcoal/15"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="mx-auto grid max-w-[1600px] gap-7 px-5 py-8 sm:px-8 md:grid-cols-3 md:gap-10 lg:px-12">
                  {GROUPS.map((g) => (
                    <ChipGroup key={g.key} legend={g.legend} options={g.options} value={filters[g.key]} onChange={set(g.key)} swatches={g.swatches} />
                  ))}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-3">
                    <button type="button" onClick={() => setPanelOpen(false)} className="btn !min-h-[44px] bg-charcoal !px-5 !text-[12px] text-cream hover:bg-gold hover:text-ink">
                      Show {count}
                    </button>
                    {active.length > 0 && (
                      <button type="button" onClick={() => setFilters(EMPTY)} className="text-[13px] font-bold text-crimson underline underline-offset-4 hover:text-charcoal">
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-auto max-w-[1600px] px-5 pt-14 sm:px-8 md:pt-24 lg:px-12">
          {results.length ? (
            <motion.ul layout className="grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-[4vw] md:gap-y-32">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p, i) => (
                  // Every second cloth drops lower, so the two columns read like a magazine spread.
                  <motion.li
                    key={p.slug}
                    layout
                    className="md:even:pt-[18vh]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.9, delay: (i % 2) * 0.06, ease: EASE }}
                    >
                      <FabricCard product={p} index={i} eager={i < 2} />
                    </motion.div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="py-20 text-center">
              <p className="accent text-3xl text-charcoal/80">No cloth matches all of those just now.</p>
              <button type="button" onClick={() => setFilters(EMPTY)} className="btn-outline-dark mt-8">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <WeaveDivider from="#FAF4E4" to="#C41E1E" palette="gold" />
      <Trade id="trade" />
      <WeaveDivider from="#C41E1E" to="#0A0A0A" palette="bold" />
    </>
  )
}
