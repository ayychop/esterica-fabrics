import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowIcon, WhatsAppIcon } from '../components/ui'
import { Link, useRouter } from '../lib/router'
import { useCart } from '../lib/cart'
import { PHONE_DISPLAY, whatsappLink } from '../config'
import { Ribbons } from './ConfirmationPage'

const EASE = [0.22, 1, 0.36, 1]

// Where Stripe returns a customer after a card payment. The session id doubles as a short reference.
export default function SuccessPage() {
  const { location, navigate } = useRouter()
  const cart = useCart()
  const [sessionId] = useState(() => new URLSearchParams(location.search).get('session_id'))
  const ref = sessionId ? sessionId.slice(-8).toUpperCase() : null

  useEffect(() => {
    document.title = 'Order confirmed | Esterica Fabrics'
    if (!sessionId) {
      navigate('/shop', { replace: true })
      return
    }
    cart.clear()
  }, [])

  if (!sessionId) return null

  const show = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease: EASE },
  })

  return (
    <section className="flex min-h-[100svh] flex-col overflow-hidden bg-ink pb-28 pt-16 text-cream md:pb-32 md:pt-[76px]">
      <Ribbons />
      <div className="mx-auto w-full max-w-[1400px] px-5 pt-12 sm:px-8 md:pt-16 lg:px-12">
        <motion.p {...show(0.5)} className="text-[12px] font-semibold uppercase tracking-[0.32em] text-gold" role="status">
          Payment received by card.
        </motion.p>
        <motion.h1 {...show(0.6)} className="heading-depth-dark mt-5 font-serif text-[clamp(3.6rem,13vw,11rem)] font-semibold leading-[0.85] tracking-[-0.03em]">
          Order confirmed.
        </motion.h1>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-12">
          <motion.div {...show(0.75)} className="md:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/65">Payment reference</p>
            <p className="mt-3 whitespace-nowrap font-serif text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-none text-gold">{ref}</p>
          </motion.div>
          <motion.div {...show(0.85)} className="md:col-span-7">
            <p className="accent text-[clamp(1.5rem,2.6vw,2.1rem)] leading-snug text-cream">
              Thank you. We will cut and pack your cloth, and be in touch within opening hours.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/shop" className="btn-gold">
                Return to Shop <ArrowIcon />
              </Link>
            </div>
            <p className="mt-7 text-[14px] text-cream/65">
              A question about your order?{' '}
              <a
                href={whatsappLink(`Hi Esterica Fabrics, I just paid by card. My payment reference is ${ref}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cream underline decoration-cream/40 underline-offset-4 hover:text-gold hover:decoration-gold"
              >
                <WhatsAppIcon className="h-4 w-4" /> Message us on {PHONE_DISPLAY}
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
