import { motion } from 'framer-motion'
import { BagIcon, WhatsAppIcon } from '../ui'
import { KenteStrip } from '../Kente'
import { Link } from '../../lib/router'
import { whatsappLink } from '../../config'

// Phones only: Shop and WhatsApp always one tap away, pinned to the bottom of the screen.
export default function MobileBar() {
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
      <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
        <Link to="/shop" className="btn !min-h-[48px] border border-gold !px-3 text-gold">
          <BagIcon className="h-[18px] w-[18px]" /> Shop
        </Link>
        <a
          href={whatsappLink("Hi Esterica Fabrics, I'd like to order some kente fabric.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn !min-h-[48px] bg-gold !px-3 text-ink"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp
        </a>
      </div>
    </motion.nav>
  )
}
