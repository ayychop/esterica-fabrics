import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import CampaignTile from '../components/shop/CampaignTile'
import WeaveDivider from '../components/WeaveDivider'
import Trade from '../components/Trade'
import { COLOURS, COLOUR_HEX, EMPTY_FILTERS, OCCASIONS, PATTERNS, PRODUCTS, matchesFilters } from '../data/products'
import { useSmoothScroll } from '../lib/scroll'
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
  { key: 'occasions', legend: 'Occasion', options: OCCASIONS },
  { key: 'colours', legend: 'Colour', options: COLOURS, swatches: true },
  { key: 'patterns', legend: 'Pattern', options: PATTERNS },
]

const countOf = (f) => Object.values(f).reduce((n, list) => n + list.length, 0)
const toggle = (list, tag) => (list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
const fabricsLabel = (n) => `${n} ${n === 1 ? 'fabric' : 'fabrics'}`

// Kept outside the component, so filters survive a visit to a product and back.
let saved = { filters: EMPTY_FILTERS, sort: 'newest' }

function ShopHero() {
  const ref = useRef(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // The cloth falls away a little slower than the page as you scroll into the collection.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', still ? '0%' : '18%'])

  const show = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2, delay, ease: EASE },
  })

  return (
    <section ref={ref} className="relative isolate h-[80vh] min-h-[480px] overflow-hidden bg-ink text-cream" aria-labelledby="shop-title">
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

      <div className="flex h-full flex-col items-center justify-center px-4 pt-16 text-center md:px-6">
        <motion.p {...show(0)} className="text-[11px] font-semibold uppercase tracking-[0.4em] text-gold md:text-[12px]">
          Kente by the metre
        </motion.p>
        <motion.h1
          id="shop-title"
          {...show(0.1)}
          className="heading-depth-dark mt-5 font-serif text-[clamp(3.6rem,12vw,11rem)] font-semibold leading-[0.88] tracking-[-0.02em]"
        >
          The Collection
        </motion.h1>
        <motion.p {...show(0.28)} className="accent mt-6 max-w-xl text-[clamp(1.35rem,2.4vw,2rem)] leading-snug text-cream [text-wrap:balance]">
          Every cloth tells a story. Every metre is unique.
        </motion.p>
      </div>
    </section>
  )
}

function Chip({ on, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center gap-2 border px-3.5 text-[13px] font-semibold transition-colors duration-300 ${
        on ? 'border-charcoal bg-charcoal text-gold' : 'border-charcoal/20 text-charcoal hover:border-charcoal'
      }`}
    >
      {children}
    </button>
  )
}

// Filters live in a drawer from the right. Choices are drafted inside it and only applied with Apply,
// so the grid does not reshuffle behind the drawer with every tap.
function FilterDrawer({ open, applied, onApply, onClose }) {
  const [draft, setDraft] = useState(applied)
  const closeRef = useRef(null)
  const { stop, start } = useSmoothScroll()

  useEffect(() => {
    if (!open) return
    setDraft(applied)
    document.documentElement.style.overflow = 'hidden'
    stop()
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      start()
    }
  }, [open])

  const preview = PRODUCTS.filter((p) => matchesFilters(p, draft)).length

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-ink/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[440px] flex-col bg-cream text-charcoal shadow-[-30px_0_60px_-30px_rgba(10,10,10,0.6)]"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-charcoal/15 px-6 md:h-[76px]">
              <h2 id="filters-title" className="text-[12px] font-bold uppercase tracking-[0.3em]">Filters</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="grid h-11 w-11 place-items-center rounded-full border border-charcoal/20 transition-colors hover:border-charcoal"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-8">
              <p className="mb-8 text-[13px] leading-relaxed text-charcoal/70">Choose several in one group to see any of them. Choices in different groups narrow the collection together.</p>
              <div className="grid gap-9">
                {GROUPS.map((g) => (
                  <fieldset key={g.key}>
                    <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-charcoal/70">{g.legend}</legend>
                    <div className="flex flex-wrap gap-2">
                      {g.options.map((tag) => (
                        <Chip key={tag} on={draft[g.key].includes(tag)} onClick={() => setDraft((d) => ({ ...d, [g.key]: toggle(d[g.key], tag) }))}>
                          {g.swatches && <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full ring-1 ring-charcoal/20" style={{ background: COLOUR_HEX[tag] }} />}
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-[auto_1fr] items-center gap-4 border-t border-charcoal/15 px-6 py-5">
              <button
                type="button"
                onClick={() => setDraft(EMPTY_FILTERS)}
                disabled={countOf(draft) === 0}
                className="min-h-[44px] text-[12px] font-bold uppercase tracking-[0.2em] text-charcoal underline underline-offset-4 transition-colors hover:text-crimson disabled:no-underline disabled:opacity-35"
              >
                Clear
              </button>
              <button type="button" onClick={() => onApply(draft)} className="btn-gold !min-h-[54px] w-full">
                Apply · {fabricsLabel(preview)}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Rows alternate: 60% then 40%, then 40% then 60%. A lone last tile takes the wide frame.
function layoutFor(i, total) {
  const row = Math.floor(i / 2)
  const alone = i === total - 1 && i % 2 === 0
  const big = alone || (row % 2 === 0 ? i % 2 === 0 : i % 2 === 1)
  // The narrow frame sits low in the first kind of row and high in the second, so the edges zig-zag.
  const align = big ? '' : row % 2 === 0 ? 'md:self-end' : 'md:self-start'
  return { big, cls: `${big ? 'md:col-span-3' : 'md:col-span-2'} ${align}` }
}

export default function ShopPage() {
  const [filters, setFilters] = useState(saved.filters)
  const [sort, setSort] = useState(saved.sort)
  const [drawer, setDrawer] = useState(false)
  const triggerRef = useRef(null)
  const gridRef = useRef(null)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    saved = { filters, sort }
  }, [filters, sort])

  useEffect(() => {
    document.title = 'Shop Kente by the Metre | Esterica Fabrics'
  }, [])

  // When the filters change while you are down in the grid, bring its head (tags, first results or the
  // empty state) back into view, instead of leaving you wherever the shorter page happens to end.
  const firstFilters = useRef(true)
  useEffect(() => {
    if (firstFilters.current) return void (firstFilters.current = false)
    const section = gridRef.current
    if (section && section.getBoundingClientRect().top < 0) scrollTo(section)
  }, [filters])

  const results = useMemo(() => PRODUCTS.filter((p) => matchesFilters(p, filters)).sort(SORTS[sort].fn), [filters, sort])
  const active = GROUPS.flatMap((g) => filters[g.key].map((tag) => ({ key: g.key, tag })))
  const remove = (key, tag) => setFilters((f) => ({ ...f, [key]: f[key].filter((t) => t !== tag) }))

  const closeDrawer = () => {
    setDrawer(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <ShopHero />

      <section ref={gridRef} className="bg-cream pb-24 md:pb-40" aria-label="Fabrics">
        {/* One slim bar: the filters button on the left, the count and sort on the right */}
        <div className="sticky top-16 z-30 border-b border-charcoal/15 bg-cream md:top-[76px]">
          <div className="flex min-h-[60px] items-center gap-4 px-4 md:px-6">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setDrawer(true)}
              aria-haspopup="dialog"
              className="inline-flex min-h-[44px] items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.26em] text-charcoal transition-colors hover:text-crimson"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filters
              {active.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[11px] tracking-normal text-cream">{active.length}</span>}
            </button>
            <p className="ml-auto text-[12px] font-semibold uppercase tracking-[0.2em] text-charcoal/65 max-sm:hidden" aria-live="polite">
              {fabricsLabel(results.length)}
            </p>
            <label className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-charcoal max-sm:ml-auto">
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
        </div>

        <div className="px-4 pt-4 md:px-6 md:pt-6">
          {/* Active filters as small tags at the head of the grid */}
          <AnimatePresence initial={false}>
            {active.length > 0 && (
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <ul className="flex flex-wrap items-center gap-2 pb-4 md:pb-6" aria-label="Active filters">
                  {active.map(({ key, tag }) => (
                    <li key={`${key}-${tag}`}>
                      <button
                        type="button"
                        onClick={() => remove(key, tag)}
                        aria-label={`Remove filter: ${tag}`}
                        className="inline-flex min-h-[32px] items-center gap-2 bg-charcoal px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-crimson hover:text-cream"
                      >
                        {tag} <span aria-hidden="true" className="text-[14px] leading-none">×</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="ml-1 min-h-[32px] text-[11px] font-bold uppercase tracking-[0.18em] text-charcoal underline underline-offset-4 hover:text-crimson">
                      Clear all
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {results.length ? (
            <motion.ul layout className="grid grid-cols-1 gap-y-4 md:grid-cols-5 md:gap-x-6 md:gap-y-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p, i) => {
                  const { big, cls } = layoutFor(i, results.length)
                  return (
                    <motion.li
                      key={p.slug}
                      layout
                      className={cls}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      {/* Slow, deliberate rise as each frame scrolls in, the second of a row a beat behind */}
                      <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 1.5, delay: (i % 2) * 0.15, ease: EASE }}
                      >
                        <CampaignTile product={p} big={big} index={i} eager={i < 2} />
                      </motion.div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="flex min-h-[50vh] flex-col items-center justify-center border-y border-charcoal/15 px-6 py-20 text-center" role="status">
              <p className="max-w-lg font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-tight text-charcoal [text-wrap:balance]">
                No fabrics match this combination.
              </p>
              <p className="mt-3 text-[15px] text-charcoal/70">Try adjusting your filters.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setDrawer(true)} className="btn-gold">
                  Adjust filters
                </button>
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn-outline-dark">
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <FilterDrawer
        open={drawer}
        applied={filters}
        onApply={(f) => {
          setFilters(f)
          closeDrawer()
        }}
        onClose={closeDrawer}
      />

      <WeaveDivider from="#FAF4E4" to="#C41E1E" palette="gold" />
      <Trade id="trade" />
      <WeaveDivider from="#C41E1E" to="#0A0A0A" palette="bold" />
    </>
  )
}
