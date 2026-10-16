import { AnimatePresence, motion } from 'framer-motion'
import { BagIcon, WhatsAppIcon } from '../ui'
import { KenteStrip } from '../Kente'
import { Link } from '../../lib/router'
import { useSmoothScroll } from '../../lib/scroll'
import { whatsappLink } from '../../config'

// Phones only: Shop and WhatsApp always one tap away, pinned to the bottom of the screen.
// Back to top joins them here once you have scrolled, so nothing floats over the page.
export default function MobileBar({ showTop = false }) {
  const { scrollTo } = useSmoothScroll()
  return (
    <motion.nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 bg-charcoal md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34, delay: 0.4 }}
    >
      <KenteStrip height={5} />
      <div className="flex gap-2 px-3 py-2.5">
        <Link to="/shop" className="btn !min-h-[48px] flex-1 border border-gold !px-3 text-gold">
          <BagIcon className="h-[18px] w-[18px]" /> Shop
        </Link>
        <a
          href={whatsappLink("Hi Esterica Fabrics, I'd like to order some kente fabric.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn !min-h-[48px] flex-1 bg-gold !px-3 text-ink"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp
        </a>
        <AnimatePresence initial={false}>
          {showTop && (
            <motion.button
              type="button"
              aria-label="Back to top"
              onClick={() => scrollTo(0)}
              className="grid shrink-0 place-items-center overflow-hidden rounded-[3px] border border-gold/50 text-gold active:bg-gold active:text-ink"
              initial={{ width: 0, opacity: 0, marginLeft: -8 }}
              animate={{ width: 48, opacity: 1, marginLeft: 0 }}
              exit={{ width: 0, opacity: 0, marginLeft: -8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
