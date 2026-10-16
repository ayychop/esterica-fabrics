import { motion } from 'framer-motion'
import { Reveal, WhatsAppIcon } from './ui'
import { KenteWatermark } from './Kente'
import { whatsappLink } from '../config'
import { TRADE_MIN } from '../lib/pricing'

const BANDS = [
  { min: '5m+', title: '10% off', text: 'Taken off automatically on any one fabric in your cart.' },
  { min: '10m+', title: '15% off', text: 'Taken off automatically. Ideal for a family or a small bridal party.' },
  { min: `${TRADE_MIN}m+`, title: 'Trade price', text: 'Larger orders are priced by hand. Message us and we will quote you.' },
]

const WHO = ['Tailors and seamstresses', 'Fashion designers and labels', 'Wedding and event planners', 'Churches, choirs and associations']

export const TRADE_MESSAGE = `Hi Esterica Fabrics, I'd like trade pricing for an order of ${TRADE_MIN} metres or more.\nI am a: (tailor / designer / event planner)\nFabric(s):\nMetres:\nNeeded by:`

export default function Trade({ id = 'trade' }) {
  return (
    <section id={id} className="section-pad relative overflow-hidden bg-crimson text-cream">
      <KenteWatermark className="-right-48 -top-40" size={600} opacity={0.1} color="#0A0A0A" />
      <div className="container-site relative grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-gold-light">Trade and wholesale</p>
            <h2 className="heading-depth-dark font-serif text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.01em]">
              Tailors, Designers, Event Planners
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-cream/85">
              Dressing a wedding party, a choir or a whole collection? Buy by the bolt and the price comes down. Tell us the cloth and the metres and you will hear back from a real person, usually the same day.
            </p>
            <ul className="mt-6 grid gap-2 text-[15px] text-cream/90 sm:grid-cols-2">
              {WHO.map((w) => (
                <li key={w} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 rotate-45 bg-gold" />
                  {w}
                </li>
              ))}
            </ul>
            <a
              href={whatsappLink(TRADE_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-9 min-h-[60px] w-full bg-ink px-8 text-gold shadow-[0_18px_36px_-14px_rgba(10,10,10,0.6)] hover:-translate-y-0.5 hover:bg-charcoal sm:w-auto"
            >
              <WhatsAppIcon /> Enquire for Trade Pricing
            </a>
          </Reveal>
        </div>

        <ol className="grid gap-4 self-center sm:grid-cols-3 lg:col-span-7 lg:gap-5">
          {BANDS.map((b, i) => (
            <motion.li
              key={b.min}
              className={`relative flex flex-col p-6 md:p-7 ${i === 2 ? 'bg-gold text-ink' : 'bg-ink text-cream'}`}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <span aria-hidden="true" className="absolute inset-[6px] border border-dashed border-current opacity-20" />
              <span className={`relative text-[12px] font-bold uppercase tracking-[0.26em] ${i === 2 ? 'text-crimson' : 'text-gold'}`}>{b.min}</span>
              <span className="relative mt-3 font-serif text-[2rem] font-semibold leading-none md:text-[2.3rem]">{b.title}</span>
              <span className={`relative mt-4 text-[14px] leading-relaxed ${i === 2 ? 'text-ink/80' : 'text-cream/75'}`}>{b.text}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
