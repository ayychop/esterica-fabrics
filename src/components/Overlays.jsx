import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WhatsAppIcon } from './ui'
import { useConsent } from '../lib/consent'
import { useSmoothScroll } from '../lib/scroll'
import { whatsappLink } from '../config'

const spring = { type: 'spring', stiffness: 380, damping: 34 }

// The WhatsApp orb: always present, bottom right, with a slow heartbeat.
export function WhatsAppOrb() {
  return (
    <motion.a
      href={whatsappLink("Hi Esterica Fabrics, I'd like to enquire about your kente fabric.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Enquire on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 md:bottom-8 md:right-8"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay: 0.6 }}
    >
      <span aria-hidden="true" className="orb-ring absolute inset-0 rounded-full border-2 border-gold" />
      <span aria-hidden="true" className="orb-ring-2 absolute inset-0 rounded-full bg-gold/30" />
      <span className="orb-beat relative grid h-[62px] w-[62px] place-items-center rounded-full text-ink shadow-[0_14px_30px_-8px_rgba(232,179,26,0.65),inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-6px_14px_rgba(140,95,0,0.45)] md:h-[70px] md:w-[70px]"
        style={{ background: 'radial-gradient(circle at 35% 30%, #FFE27A 0%, #E8B31A 45%, #946B00 100%)' }}>
        <span aria-hidden="true" className="absolute inset-[5px] rounded-full border border-dashed border-ink/25" />
        <WhatsAppIcon className="h-7 w-7 md:h-8 md:w-8" />
      </span>
      <span className="accent pointer-events-none absolute right-full top-1/2 mr-4 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-charcoal px-4 py-1.5 text-lg text-cream opacity-0 shadow-lg transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
        Enquire on WhatsApp
      </span>
    </motion.a>
  )
}

// Standard 12: back to top, bottom right, after the hero.
export function BackToTop({ visible }) {
  const { scrollTo } = useSmoothScroll()
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => scrollTo(0)}
          className="fixed bottom-[96px] right-[29px] z-40 grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-charcoal/90 text-gold shadow-xl backdrop-blur transition-colors hover:bg-gold hover:text-ink md:bottom-[118px] md:right-[43px]"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={spring}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Cookie settings, opened from the footer. The choice is saved in localStorage.
export function CookieBanner() {
  const { bannerOpen, setConsent, consent, closeBanner } = useConsent()
  return (
    <AnimatePresence>
      {bannerOpen && (
        <motion.div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md border border-dashed border-gold/40 bg-charcoal p-6 text-cream shadow-2xl md:bottom-8 md:left-8 md:right-auto md:mx-0"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={spring}
        >
          <p className="accent text-2xl">Cookie settings</p>
          <p className="mt-2 text-sm leading-relaxed text-cream/70">
            The only cookies on this site come from Google Maps, and only once you choose to load the map. Nothing else tracks you.
            {consent && <span className="mt-1 block text-cream/50">Current choice: {consent}.</span>}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => setConsent('accepted')} className="btn-gold !min-h-[42px] text-sm">
              Allow map cookies
            </button>
            <button type="button" onClick={() => setConsent('declined')} className="btn-outline-light !min-h-[42px] text-sm">
              Decline
            </button>
            {consent && (
              <button type="button" onClick={closeBanner} className="ml-auto text-sm text-cream/60 underline underline-offset-4">
                Close
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const LEGAL = {
  privacy: {
    title: 'Privacy',
    body: [
      'Esterica Fabrics respects your privacy. This website does not collect personal data through analytics or advertising tools.',
      'When you contact us on WhatsApp, by phone or through the enquiry form, we use your details only to answer your enquiry and fulfil your order.',
      'If you accept cookies, Google may set cookies when the map loads. You can withdraw that choice at any time from Cookie Settings.',
      'To ask about the information we hold, please contact us on WhatsApp or by phone.',
    ],
  },
  terms: {
    title: 'Terms',
    body: [
      'All fabrics are sold by the metre and a minimum order applies. Prices and availability are confirmed with you directly before any order is placed.',
      'Because every cloth is woven by hand, colours and patterns may vary slightly from photographs.',
      'We post to addresses in the UK and Ireland. Postage is calculated at the time of order. Collection is free from our Wembley unit during opening hours.',
      'Full terms of sale will be provided with your order confirmation.',
    ],
  },
}

export function LegalModal({ which, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    if (!which) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [which, onClose])

  const doc = which && LEGAL[which]
  return (
    <AnimatePresence>
      {doc && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/70" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-title"
            data-lenis-prevent
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md bg-cream p-8 text-charcoal shadow-2xl"
            initial={{ y: 24, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.98 }}
          >
            <h2 id="legal-title" className="heading-depth font-serif text-3xl font-semibold">{doc.title}</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-charcoal/75">
              {doc.body.map((p) => <p key={p}>{p}</p>)}
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="btn-outline-dark mt-8">Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
