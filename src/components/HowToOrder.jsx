import { useRef } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import { Reveal, WhatsAppIcon } from './ui'
import { kenteDataUri } from './Kente'
import { NUMERALS } from './numeralPaths'
import { whatsappLink } from '../config'

const STEPS = [
  { n: '1', title: 'Browse the collection', text: 'Explore the collection online or in store and choose the cloth that speaks to you.' },
  { n: '2', title: 'Send us a WhatsApp', text: 'Tell us the fabric name and how many metres you need.' },
  { n: '3', title: 'We confirm availability and pricing', text: 'You hear back from a real person, usually the same day.' },
  { n: '4', title: 'Collect or have it posted', text: 'Collect in store, or we post it to you anywhere in the UK and Ireland.' },
]

// Big, clear Arabic numerals (Playfair Display Bold, lining figures). Each outline draws itself on,
// then fills solid: bold and easy to read at a glance.
function Numeral({ value }) {
  const g = NUMERALS[value]
  return (
    <svg aria-hidden="true" viewBox={`-6 -6 ${g.w + 12} 86`} className="h-20 w-auto overflow-visible md:h-[8.25rem]">
      <motion.path
        d={g.d}
        stroke="#C41E1E"
        strokeWidth="1.4"
        strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0, fillOpacity: 0 }, shown: { pathLength: 1, fillOpacity: 1 } }}
        transition={{ pathLength: { duration: 0.9, ease: [0.65, 0, 0.35, 1] }, fillOpacity: { duration: 0.5, delay: 0.65 } }}
        fill="#C41E1E"
      />
    </svg>
  )
}

const line = { hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }

export default function HowToOrder() {
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 70%'] })
  // The thread only ever grows: scrolling back up never unwinds it.
  const grown = useMotionValue(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > grown.get()) grown.set(v)
  })

  return (
    <section id="order" className="relative overflow-hidden bg-gold pb-28 pt-12 text-ink md:py-14">
      {/* a whisper of Kente in the gold */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.045]" style={{ backgroundImage: kenteDataUri, backgroundSize: '160px 60px' }} />

      <div className="container-site relative grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-28">
            <p className="eyebrow text-ink">Simple and personal</p>
            <h2 className="font-serif text-[clamp(3rem,6vw,5.6rem)] font-bold leading-[0.92] tracking-[-0.02em] text-ink [text-shadow:0_1px_0_rgba(255,240,180,0.6),0_14px_30px_rgba(120,70,0,0.22)]">
              How to Order
              <span className="accent mt-2 block pl-[0.4em] text-[0.62em] font-medium leading-none text-crimson">by conversation</span>
            </h2>
            <p className="mt-7 max-w-sm text-[16px] leading-[1.8] text-ink/80">No baskets and no checkouts. Ordering cloth should feel like visiting a good tailor.</p>
            <a
              href={whatsappLink("Hi Esterica Fabrics, I'd like to place an order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-8 min-h-[62px] bg-ink px-9 text-[15px] text-gold shadow-[0_18px_36px_-14px_rgba(10,10,10,0.6)] hover:-translate-y-0.5 hover:bg-charcoal"
            >
              <WhatsAppIcon className="h-6 w-6" /> Start your order
            </a>
          </Reveal>
        </div>

        <ol ref={listRef} className="relative lg:col-span-7">
          {/* the thread that runs through every step, drawn down as you read */}
          <motion.span
            aria-hidden="true"
            className="absolute bottom-10 left-[3.25rem] top-10 w-[2px] origin-top md:left-[5rem]"
            style={{ scaleY: grown, background: 'repeating-linear-gradient(to bottom, #0A0A0A 0 10px, #C41E1E 10px 16px, #0A0A0A 16px 26px, #0F7A34 26px 32px)' }}
          />
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              className="relative grid grid-cols-[6.5rem_1fr] items-center gap-4 py-3 md:grid-cols-[10rem_1fr] md:gap-8 md:py-2"
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, amount: 0.6 }}
            >
              <span className="relative flex justify-center bg-gold py-1">
                <Numeral value={s.n} />
                <span className="sr-only">Step {s.n}</span>
              </span>
              <motion.div
                className={i < STEPS.length - 1 ? 'border-b border-dashed border-ink/25 pb-5 md:pb-6' : 'pb-1'}
                variants={{ hidden: {}, shown: { transition: { delayChildren: 0.5, staggerChildren: 0.18 } } }}
              >
                <motion.h3 variants={line} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="font-serif text-[1.6rem] font-semibold leading-[1.1] md:text-[2.1rem]">
                  {s.title}
                </motion.h3>
                <motion.p variants={line} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mt-2 max-w-md text-[16px] leading-[1.85] text-ink/75">
                  {s.text}
                </motion.p>
              </motion.div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
