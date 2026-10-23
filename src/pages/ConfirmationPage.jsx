import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowIcon, WhatsAppIcon } from '../components/ui'
import { Link, useRouter } from '../lib/router'
import { CONFIRM_KEY } from './CheckoutPage'
import { INSTAGRAM_URL, whatsappLink } from '../config'

const EASE = [0.22, 1, 0.36, 1]

// Kente ribbons that unfurl from the top: solid colour strips of uneven length, like cloth let fall in celebration.
const RIBBON_COLOURS = ['#E8B31A', '#C41E1E', '#0F7A34', '#E8B31A', '#1A4DA0', '#FAF4E4', '#C41E1E', '#E8B31A', '#0F7A34', '#1A4DA0']
const RIBBON_LENGTHS = [62, 88, 46, 100, 70, 38, 84, 56, 94, 50, 76, 42, 90, 64, 34, 80, 58, 96, 44, 72]

export function Ribbons() {
  return (
    <div aria-hidden="true" className="flex h-[16vh] min-h-[90px] items-start md:h-[22vh]">
      {RIBBON_LENGTHS.map((len, i) => (
        <motion.span
          key={i}
          className="block flex-1 origin-top"
          style={{ height: `${len}%`, background: RIBBON_COLOURS[i % RIBBON_COLOURS.length] }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.15 + ((i * 7) % RIBBON_LENGTHS.length) * 0.035, ease: EASE }}
        />
      ))}
    </div>
  )
}

const InstagramIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

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
    document.title = 'Thank you | Esterica Fabrics'
    if (!order) navigate('/shop', { replace: true })
  }, [])

  if (!order) return null

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
          {order.name ? `Thank you, ${order.name}. ` : ''}Your order has been sent via WhatsApp.
        </motion.p>
        <motion.h1 {...show(0.6)} className="heading-depth-dark mt-5 font-serif text-[clamp(4.5rem,15vw,12rem)] font-semibold leading-[0.85] tracking-[-0.03em]">
          Thank you.
        </motion.h1>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-12">
          <motion.div {...show(0.75)} className="md:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/65">Order reference</p>
            <p className="mt-3 whitespace-nowrap font-serif text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-none text-gold">{order.ref}</p>
          </motion.div>
          <motion.div {...show(0.85)} className="md:col-span-7">
            <p className="accent text-[clamp(1.5rem,2.6vw,2.1rem)] leading-snug text-cream">
              Your order has been sent to us on WhatsApp. We will confirm within opening hours.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/shop" className="btn-gold">
                Return to Shop <ArrowIcon />
              </Link>
              {INSTAGRAM_URL && (
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
                  <InstagramIcon /> Follow us on Instagram
                </a>
              )}
            </div>
            <p className="mt-7 text-[14px] text-cream/65">
              WhatsApp did not open?{' '}
              <a href={whatsappLink(order.message)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-cream underline decoration-cream/40 underline-offset-4 hover:text-gold hover:decoration-gold">
                <WhatsAppIcon className="h-4 w-4" /> Open the message again
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
