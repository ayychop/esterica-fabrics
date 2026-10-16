import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { KenteStrip, KenteWatermark } from '../components/Kente'
import { ArrowIcon, CheckIcon, WhatsAppIcon } from '../components/ui'
import { Link, useRouter } from '../lib/router'
import { CONFIRM_KEY } from './CheckoutPage'
import { whatsappLink } from '../config'

function readSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(CONFIRM_KEY))
  } catch {
    return null
  }
}

export default function ConfirmationPage() {
  const { location, navigate } = useRouter()
  const [order] = useState(() => location.data ?? readSaved())

  useEffect(() => {
    document.title = 'Order sent | Esterica Fabrics'
    if (!order) navigate('/shop', { replace: true })
  }, [])

  if (!order) return null
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-charcoal pb-24 pt-28 text-cream md:pt-32">
      <KenteStrip height={14} className="absolute inset-x-0 top-[64px] md:top-[76px]" />
      <KenteWatermark className="-bottom-40 -right-40" size={620} opacity={0.08} />
      <div className="container-site relative">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-ink"
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.25 }}
          >
            <CheckIcon className="h-9 w-9" />
          </motion.span>
          <h1 className="heading-depth-dark mt-8 font-serif text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[1.02]">
            Thank you{order.name ? `, ${order.name}` : ''}.
          </h1>
          <p className="accent mt-3 text-[clamp(1.5rem,3vw,2.1rem)] text-gold">Your order has been sent via WhatsApp.</p>
          <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-cream/80">
            Order reference <strong className="whitespace-nowrap text-cream">{order.ref}</strong>. A real person will check stock, confirm your total and send payment details, usually the same day during opening hours.
          </p>
          <p className="mx-auto mt-4 max-w-lg text-[14px] text-cream/60">If WhatsApp did not open, or you have not pressed send yet, you can open the message again.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={whatsappLink(order.message)} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
              <WhatsAppIcon /> Open the message again
            </a>
            <Link to="/shop" className="btn-gold">
              Keep shopping <ArrowIcon />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
