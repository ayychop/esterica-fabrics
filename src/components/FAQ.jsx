import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionHeading, Reveal } from './ui'
import { WovenRule } from './Kente'

const FAQS = [
  ['Do you sell by the metre?', 'Yes, all fabrics are sold by the metre and cut to length in half metres.'],
  ['Can I see the fabric before buying?', 'Absolutely. Pop in during opening hours.'],
  ['Do you ship internationally?', 'Currently we ship to the UK and Ireland only. Get in touch for other requests.'],
  ['How do I place an order?', 'Add fabrics to your cart and check out on WhatsApp, or message us with the fabric name and metres you need.'],
  ['Do you offer bulk or trade pricing?', 'Yes. 5 metres or more of one cloth is 10% off and 10 metres or more is 15% off, applied automatically. For 20 metres or more, ask us for trade pricing.'],
  ['How long does delivery take?', 'UK delivery takes 2 to 3 business days. Standard post is £4.95, free on orders over £75.'],
]

const EASE = [0.22, 1, 0.36, 1]

function Item({ q, a, i, open, onToggle }) {
  const id = `faq-${i}`
  return (
    <div className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr]">
      {/* The active question's number lights up gold in the margin */}
      <span
        aria-hidden="true"
        className={`pt-[1.3rem] font-script text-2xl italic leading-none transition-[color,transform] duration-500 md:text-[1.9rem] ${
          open ? 'translate-x-0 text-gold' : '-translate-x-1 text-charcoal/25'
        }`}
      >
        {String(i + 1).padStart(2, '0')}
      </span>
      <div>
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-6 py-4 text-left"
        >
          <span
            className={`font-serif text-[1.35rem] font-semibold leading-snug underline decoration-gold decoration-2 underline-offset-[8px] transition-[color,text-decoration-color] duration-500 group-hover:text-crimson md:text-[1.8rem] ${
              open ? 'text-charcoal' : 'text-charcoal decoration-transparent'
            }`}
          >
            {q}
          </span>
          <span
            aria-hidden="true"
            className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? 'rotate-[135deg] border-crimson bg-crimson text-cream' : 'rotate-0 border-charcoal/25 text-charcoal'
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 2v12M2 8h12" />
            </svg>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.55, ease: EASE }, opacity: { duration: 0.4, delay: 0.12 } } }}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.2 } } }}
          >
            <p className="accent pb-5 pr-10 text-[1.3rem] leading-snug text-charcoal/80 md:pr-14 md:text-[1.5rem]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <WovenRule className="col-span-2 opacity-80" />
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section-pad bg-cream">
      <div className="container-site grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Good to know" title="Frequently Asked Questions" size="sm" className="lg:sticky lg:top-32" />
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <WovenRule className="opacity-80" />
          {FAQS.map(([q, a], i) => (
            <Item key={q} q={q} a={a} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
