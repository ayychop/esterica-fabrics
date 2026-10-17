import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLOURS, COLOUR_HEX, EMPTY_FILTERS, OCCASIONS, PATTERNS } from '../../data/products'
import { useSmoothScroll } from '../../lib/scroll'

const EASE = [0.22, 1, 0.36, 1]

export const FILTER_GROUPS = [
  { key: 'occasions', legend: 'Occasion', options: OCCASIONS },
  { key: 'colours', legend: 'Colour', options: COLOURS, swatches: true },
  { key: 'patterns', legend: 'Pattern', options: PATTERNS },
]

export const filterCount = (f) => Object.values(f).reduce((n, list) => n + list.length, 0)
const toggle = (list, tag) => (list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
const fabrics = (n) => `${n} ${n === 1 ? 'fabric' : 'fabrics'}`

// Full-screen frosted glass. Every tap applies at once, so the swatch book and grid behind the glass
// change while you choose; "Show" simply closes the overlay.
export default function FilterOverlay({ open, filters, onChange, onClose, results }) {
  const closeRef = useRef(null)
  const { stop, start } = useSmoothScroll()

  useEffect(() => {
    if (!open) return
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-title"
          data-lenis-prevent
          className="fixed inset-0 z-[60] overflow-y-auto bg-ink/70 text-cream backdrop-blur-2xl backdrop-saturate-150"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <motion.div
            className="mx-auto flex min-h-full max-w-6xl flex-col px-6 py-8 md:px-10 md:py-12"
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            exit={{ y: 12 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center justify-between gap-6">
              <h2 id="filter-title" className="font-serif text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-none">Filter</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="grid h-12 w-12 place-items-center rounded-full border border-cream/30 transition-colors hover:border-gold hover:text-gold"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream/75">
              Pick several in one group to see any of them. Picks in different groups narrow the collection together.
            </p>

            <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-12">
              {FILTER_GROUPS.map((g) => (
                <fieldset key={g.key}>
                  <legend className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">{g.legend}</legend>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map((tag) => {
                      const on = filters[g.key].includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={on}
                          onClick={() => onChange({ ...filters, [g.key]: toggle(filters[g.key], tag) })}
                          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-300 ${
                            on ? 'border-gold bg-gold text-ink' : 'border-cream/30 text-cream hover:border-cream'
                          }`}
                        >
                          {g.swatches && <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full ring-1 ring-cream/50" style={{ background: COLOUR_HEX[tag] }} />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="mt-auto flex flex-col-reverse gap-4 pt-12 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTERS)}
                disabled={filterCount(filters) === 0}
                className="min-h-[44px] self-start text-[12px] font-bold uppercase tracking-[0.22em] underline underline-offset-4 transition-colors hover:text-gold disabled:no-underline disabled:opacity-35 sm:self-auto"
              >
                Clear all
              </button>
              <button type="button" onClick={onClose} className="btn-gold min-h-[58px] w-full sm:w-auto sm:min-w-[280px]" aria-live="polite">
                {results ? `Show ${fabrics(results)}` : 'No fabrics match'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
