import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SwatchBook from '../components/shop/SwatchBook'
import FilterOverlay, { FILTER_GROUPS, filterCount } from '../components/shop/FilterOverlay'
import CampaignTile from '../components/shop/CampaignTile'
import WeaveDivider from '../components/WeaveDivider'
import Trade from '../components/Trade'
import { EMPTY_FILTERS, PRODUCTS, matchesFilters } from '../data/products'
import { useSmoothScroll } from '../lib/scroll'

const EASE = [0.22, 1, 0.36, 1]

const SORTS = {
  newest: { label: 'Newest', fn: (a, b) => b.added.localeCompare(a.added) },
  'price-asc': { label: 'Price, low to high', fn: (a, b) => a.perMetre - b.perMetre || a.name.localeCompare(b.name) },
  'price-desc': { label: 'Price, high to low', fn: (a, b) => b.perMetre - a.perMetre || a.name.localeCompare(b.name) },
}

const fabrics = (n) => `${n} ${n === 1 ? 'fabric' : 'fabrics'}`

// Kept outside the component, so filters survive a visit to a product and back.
let saved = { filters: EMPTY_FILTERS, sort: 'newest' }

export default function ShopPage() {
  const [filters, setFilters] = useState(saved.filters)
  const [sort, setSort] = useState(saved.sort)
  const [overlay, setOverlay] = useState(false)
  const [pillOn, setPillOn] = useState(true)
  const triggerRef = useRef(null)
  const browseRef = useRef(null)
  const shopRef = useRef(null)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    saved = { filters, sort }
  }, [filters, sort])

  useEffect(() => {
    document.title = 'Shop Kente by the Metre | Esterica Fabrics'
  }, [])

  // The floating Filter button belongs to the swatch book and the grid; it bows out over the trade section and footer.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPillOn(e.isIntersecting), { rootMargin: '0px 0px -40% 0px' })
    io.observe(shopRef.current)
    return () => io.disconnect()
  }, [])

  const results = useMemo(() => PRODUCTS.filter((p) => matchesFilters(p, filters)).sort(SORTS[sort].fn), [filters, sort])
  const active = FILTER_GROUPS.flatMap((g) => filters[g.key].map((tag) => ({ key: g.key, tag })))
  const remove = (key, tag) => setFilters((f) => ({ ...f, [key]: f[key].filter((t) => t !== tag) }))

  const closeOverlay = () => {
    setOverlay(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  const emptyActions = (
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <button type="button" onClick={() => setOverlay(true)} className="btn-gold">Adjust filters</button>
      <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn-outline-light">Clear all</button>
    </div>
  )

  return (
    <>
      <div ref={shopRef} className="pt-16 md:pt-[76px]">
        <SwatchBook products={results} browse={() => scrollTo(browseRef.current)} empty={emptyActions} />

        {/* Browse all: every cloth at once, edge to edge, words on the cloth */}
        <section ref={browseRef} id="browse" aria-labelledby="browse-title" className="scroll-mt-[76px] bg-ink text-cream">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-4 pb-6 pt-16 md:px-6 md:pt-24">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Browse all</p>
              <h2 id="browse-title" className="mt-3 font-serif text-[clamp(2.6rem,6vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.02em]">Every cloth</h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-cream/70" aria-live="polite">{fabrics(results.length)}</p>
              <label className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em]">
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="min-h-[44px] cursor-pointer border-0 border-b border-cream/30 bg-transparent pr-1 text-[14px] font-semibold normal-case tracking-normal text-cream focus:border-gold focus:outline-none [&>option]:text-ink"
                >
                  {Object.entries(SORTS).map(([k, s]) => (
                    <option key={k} value={k}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
            {active.length > 0 && (
              <ul className="flex w-full flex-wrap items-center gap-2" aria-label="Active filters">
                {active.map(({ key, tag }) => (
                  <li key={`${key}-${tag}`}>
                    <button
                      type="button"
                      onClick={() => remove(key, tag)}
                      aria-label={`Remove filter: ${tag}`}
                      className="inline-flex min-h-[32px] items-center gap-2 rounded-full border border-gold/60 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink"
                    >
                      {tag} <span aria-hidden="true" className="text-[14px] leading-none">×</span>
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="ml-1 min-h-[32px] text-[11px] font-bold uppercase tracking-[0.18em] underline underline-offset-4 hover:text-gold">
                    Clear all
                  </button>
                </li>
              </ul>
            )}
          </div>

          {results.length ? (
            <motion.ul layout className="grid grid-cols-1 gap-[2px] md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p, i) => (
                  <motion.li key={p.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                    <motion.div
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 1.4, delay: (i % 3) * 0.12, ease: EASE }}
                    >
                      <CampaignTile product={p} big index={i} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                    </motion.div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <p className="px-6 pb-24 pt-10 text-center text-[16px] text-cream/75" role="status">
              No fabrics match this combination. Try adjusting your filters.
            </p>
          )}
        </section>
      </div>

      {/* The one control for filtering: a small floating pill */}
      <AnimatePresence>
        {pillOn && !overlay && (
          <motion.button
            ref={triggerRef}
            type="button"
            onClick={() => setOverlay(true)}
            aria-haspopup="dialog"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed left-4 top-[76px] z-30 inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-cream/30 bg-ink/50 px-4 text-[12px] font-bold uppercase tracking-[0.24em] text-cream shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-gold hover:text-gold md:left-6 md:top-[92px]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filter
            {filterCount(filters) > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] tracking-normal text-ink">{filterCount(filters)}</span>}
          </motion.button>
        )}
      </AnimatePresence>

      <FilterOverlay open={overlay} filters={filters} onChange={setFilters} onClose={closeOverlay} results={results.length} />

      <WeaveDivider from="#0A0A0A" to="#C41E1E" palette="gold" />
      <Trade id="trade" />
      <WeaveDivider from="#C41E1E" to="#0A0A0A" palette="bold" />
    </>
  )
}
