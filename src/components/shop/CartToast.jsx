import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from '../ui'
import { Link } from '../../lib/router'
import { useCart } from '../../lib/cart'
import { productBySlug } from '../../data/products'
import { TRADE_MIN, metresLabel } from '../../lib/pricing'

// A short note under the header each time something goes in the cart.
export default function CartToast() {
  const { notice, dismissNotice } = useCart()

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(dismissNotice, notice.capped ? 6000 : 3800)
    return () => clearTimeout(t)
  }, [notice])

  const product = notice && productBySlug(notice.slug)
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 top-[76px] z-[45] flex justify-end md:right-8 md:top-[92px]">
      <AnimatePresence>
        {product && (
          <motion.div
            key={notice.id}
            role="status"
            className="pointer-events-auto w-full max-w-sm border-l-4 border-gold bg-charcoal p-4 text-cream shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <p className="flex items-start gap-2.5 text-[15px] leading-snug">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {notice.added > 0 ? (
                  <>
                    Added {metresLabel(notice.added)} of <strong className="font-semibold">{product.name}</strong>. You have {metresLabel(notice.total)} in your cart.
                  </>
                ) : (
                  <>You already have the most we can take online of {product.name}.</>
                )}
                {notice.capped && <span className="mt-1 block text-cream/70">For {TRADE_MIN}m or more, ask us for trade pricing on WhatsApp.</span>}
              </span>
            </p>
            <div className="mt-3 flex items-center gap-4 pl-[26px]">
              <Link to="/cart" onClick={dismissNotice} className="text-[12px] font-bold uppercase tracking-[0.18em] text-gold hover:text-gold-light">
                View cart
              </Link>
              <button type="button" onClick={dismissNotice} className="text-[12px] font-semibold uppercase tracking-[0.18em] text-cream/60 hover:text-cream">
                Keep shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
