import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'
import { KenteStrip } from './Kente'
import { PhoneIcon } from './ui'
import { NAV_LINKS, PHONE_DISPLAY, PHONE_TEL } from '../config'
import { useSmoothScroll } from '../lib/scroll'

const MenuIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

const CloseIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const roundBtn =
  'grid h-10 w-10 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:border-gold hover:text-gold'

// No WhatsApp button here: the gold orb carries that job on every screen.
export default function Header({ solid, activeId }) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const closeRef = useRef(null)
  const { stop, start } = useSmoothScroll()

  // Unlock scrolling straight away (not in an effect) so a tapped link's smooth scroll is not swallowed.
  const close = useCallback(() => {
    setOpen(false)
    document.documentElement.style.overflow = ''
    start()
  }, [start])

  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = 'hidden'
    stop()
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    const desktop = window.matchMedia('(min-width: 1024px)')
    const onResize = () => desktop.matches && close()
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
      document.documentElement.style.overflow = ''
      start()
      toggleRef.current?.focus({ preventScroll: true })
    }
  }, [open, close, stop, start])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-500 ${
          solid ? 'bg-charcoal/95 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)] backdrop-blur-md' : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container-site flex h-16 items-center justify-between md:h-[76px]">
          <a href="#top" aria-label="Esterica Fabrics, back to top" className="block">
            <Logo className="h-9 w-auto md:h-11" />
          </a>
          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={activeId === l.id ? 'true' : undefined}
                    className={`group relative text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                      activeId === l.id ? 'text-gold' : 'text-cream/75 hover:text-cream'
                    }`}
                  >
                    {l.label}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1.5 left-0 h-px w-full origin-left border-t border-dashed border-gold transition-transform duration-300 ${
                        activeId === l.id ? 'scale-x-100 border-solid' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2.5 lg:hidden">
            <a href={`tel:${PHONE_TEL}`} aria-label="Call Esterica Fabrics" className={roundBtn}>
              <PhoneIcon className="h-[18px] w-[18px]" />
            </a>
            <button
              ref={toggleRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
              className={roundBtn}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* A sibling of the header, not a child: the header's backdrop blur would trap a fixed overlay inside it. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            // Tapping anywhere that is not a link or button closes the menu.
            onClick={(e) => !e.target.closest('a, button') && close()}
            className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-charcoal text-cream lg:hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <KenteStrip height={10} className="absolute inset-x-0 top-0" />
            <div className="container-site flex h-16 shrink-0 items-center justify-between md:h-[76px]">
              <a href="#top" aria-label="Esterica Fabrics, back to top" onClick={close} className="block">
                <Logo className="h-9 w-auto md:h-11" />
              </a>
              <button ref={closeRef} type="button" aria-label="Close menu" onClick={close} className={roundBtn}>
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-1 flex-col">
              <nav aria-label="Sections" className="container-site flex flex-1 flex-col justify-center py-8">
                <ul className="space-y-1">
                  {NAV_LINKS.map((l, i) => (
                    <motion.li
                      key={l.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.35 }}
                    >
                      <a
                        href={`#${l.id}`}
                        onClick={close}
                        aria-current={activeId === l.id ? 'true' : undefined}
                        className={`inline-flex items-baseline gap-4 py-2 font-serif text-[32px] font-semibold leading-tight transition-colors sm:text-[40px] ${
                          activeId === l.id ? 'text-gold' : 'text-cream hover:text-gold'
                        }`}
                      >
                        <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-gold/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {l.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="container-site shrink-0 border-t border-dashed border-gold/30 py-6">
                <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-cream/80 transition-colors hover:text-gold">
                  <PhoneIcon className="h-[18px] w-[18px] text-gold" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
