import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageIntro from '../components/shop/PageIntro'
import ProductCard, { TIER_STYLE } from '../components/shop/ProductCard'
import WeaveDivider from '../components/WeaveDivider'
import Trade from '../components/Trade'
import { Reveal } from '../components/ui'
import { COLOURS, OCCASIONS, PATTERNS, PRODUCTS } from '../data/products'
import { TIERS, perMetreLabel } from '../lib/pricing'

const SORTS = {
  newest: { label: 'Newest', fn: (a, b) => b.added.localeCompare(a.added) },
  'price-asc': { label: 'Price, low to high', fn: (a, b) => a.perMetre - b.perMetre || a.name.localeCompare(b.name) },
  'price-desc': { label: 'Price, high to low', fn: (a, b) => b.perMetre - a.perMetre || a.name.localeCompare(b.name) },
}

const EMPTY = { occasion: null, colour: null, pattern: null }

// Kept outside the component, so filters survive a visit to a product and back.
let saved = { filters: EMPTY, sort: 'newest' }

function ChipGroup({ legend, options, value, onChange, swatches }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-charcoal/70">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {Object.entries(options).map(([key, opt]) => {
          const on = value === key
          const label = typeof opt === 'string' ? opt : opt.label
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
              {label}
            </button>
          )
        })}
      </div>
    </fieldset>
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

  const active = Object.values(filters).filter(Boolean).length
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }))

  const groups = (
    <div className="grid gap-7">
      <ChipGroup legend="Occasion" options={OCCASIONS} value={filters.occasion} onChange={set('occasion')} />
      <ChipGroup legend="Colour" options={COLOURS} value={filters.colour} onChange={set('colour')} swatches />
      <ChipGroup legend="Pattern" options={PATTERNS} value={filters.pattern} onChange={set('pattern')} />
      {active > 0 && (
        <button type="button" onClick={() => setFilters(EMPTY)} className="justify-self-start text-[13px] font-bold text-crimson underline underline-offset-4 hover:text-charcoal">
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      <PageIntro eyebrow="Kente by the metre" title="The Shop" accent="cut to your length">
        <Reveal delay={0.1} className="mt-8 grid max-w-4xl gap-6 md:mt-10">
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Price per metre">
            {Object.entries(TIERS).map(([key, t]) => (
              <li key={key} className={`flex flex-col px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] sm:flex-row sm:items-baseline sm:text-[12px] sm:tracking-[0.16em] ${TIER_STYLE[key]}`}>
                {t.label} <span className="font-serif text-[17px] normal-case tracking-normal sm:ml-2 sm:text-[15px]">{perMetreLabel(t.perMetre)}/m</span>
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-[15px] leading-relaxed text-cream/80">
            Bulk savings apply automatically: <strong className="text-gold">10% off 5m or more</strong> and <strong className="text-gold">15% off 10m or more</strong> of any one cloth. Free UK delivery on orders over £75.
          </p>
        </Reveal>
      </PageIntro>
      <WeaveDivider from="#121212" to="#FAF4E4" palette="bold" />

      <section className="bg-cream pb-16 pt-8 md:pb-24 md:pt-12" aria-label="Fabrics">
        <div className="container-site grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Desktop: filters in a side column */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-28">{groups}</div>
          </aside>

          <div className="lg:col-span-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-charcoal/25 pb-4">
              <button
                type="button"
                onClick={() => setPanelOpen((o) => !o)}
                aria-expanded={panelOpen}
                aria-controls="shop-filters"
                className="inline-flex min-h-[44px] items-center gap-2 border border-charcoal/30 px-4 text-[13px] font-bold uppercase tracking-[0.16em] lg:hidden"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filters{active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[11px] text-cream">{active}</span>}
              </button>
              <p className="hidden text-[14px] text-charcoal/70 lg:block" aria-live="polite">
                {results.length} {results.length === 1 ? 'fabric' : 'fabrics'}
              </p>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-charcoal/75">
                Sort
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="min-h-[44px] cursor-pointer border border-charcoal/30 bg-cream px-3 text-[14px] font-semibold text-charcoal focus:border-gold focus:outline-none"
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
                  className="overflow-hidden lg:hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-8 border-b border-dashed border-charcoal/25 pb-8">{groups}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mb-5 text-[14px] text-charcoal/70 lg:hidden" aria-live="polite">
              {results.length} {results.length === 1 ? 'fabric' : 'fabrics'}
            </p>

            {results.length ? (
              <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((p, i) => (
                    <motion.li
                      key={p.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProductCard product={p} eager={i < 3} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <div className="border border-dashed border-charcoal/30 px-6 py-14 text-center">
                <p className="accent text-2xl text-charcoal/80">No cloth matches all of those just now.</p>
                <button type="button" onClick={() => setFilters(EMPTY)} className="btn-outline-dark mt-6">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <WeaveDivider from="#FAF4E4" to="#C41E1E" palette="gold" />
      <Trade id="trade" />
      <WeaveDivider from="#C41E1E" to="#0A0A0A" palette="bold" />
    </>
  )
}
