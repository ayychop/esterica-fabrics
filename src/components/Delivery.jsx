import { motion } from 'framer-motion'
import { SectionHeading, WhatsAppIcon } from './ui'
import { kenteDataUri } from './Kente'
import { whatsappLink } from '../config'

// Small gold line illustrations.
const Parcel = () => (
  <svg aria-hidden="true" viewBox="0 0 72 64" className="h-14 w-16 md:h-16 md:w-[4.5rem]" fill="none" stroke="#E8B31A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22 36 10l28 12v28L36 62 8 50z" />
    <path d="M8 22l28 12 28-12M36 34v28" />
    <path d="M22 16l28 12v10" strokeDasharray="3 3" />
    {/* the string bow */}
    <path d="M36 10c-6-8-15-6-12 0 2 4 12 0 12 0zM36 10c6-8 15-6 12 0-2 4-12 0-12 0z" />
  </svg>
)
const Shopfront = () => (
  <svg aria-hidden="true" viewBox="0 0 72 64" className="h-14 w-16 md:h-16 md:w-[4.5rem]" fill="none" stroke="#E8B31A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 26v32h52V26" />
    {/* striped awning, scalloped edge */}
    <path d="M6 14h60l-4 12H10z" />
    <path d="M18 14l-2 12M30 14v12M42 14v12M54 14l2 12" />
    <path d="M10 26c0 4 8 4 8 0 0 4 8 4 8 0 0 4 8 4 8 0 0 4 8 4 8 0 0 4 8 4 8 0 0 4 8 4 8 0" />
    <path d="M30 58V40h12v18" />
    <path d="M48 38h8v8h-8z" />
    <path d="M14 8h44" strokeDasharray="2 4" />
  </svg>
)

const ITEMS = [
  { art: <Parcel />, label: 'By post', title: 'Worldwide Shipping', text: 'We ship worldwide. UK & Ireland standard post is calculated at checkout (£4.95). For international orders, please order via WhatsApp so we can calculate the exact shipping cost for your country.', link: { label: 'Order internationally on WhatsApp', href: whatsappLink("Hi Esterica Fabrics, I'd like to order fabric for delivery outside the UK and Ireland.\nCountry:\nFabric(s):\nMetres:") }, from: -140 },
  { art: <Shopfront />, label: 'In person', title: 'Collect in Store', text: 'Choose Click & Collect at checkout and collect free from our Wembley unit during opening hours.', from: 140 },
]

export default function Delivery() {
  return (
    <section
      id="delivery"
      className="relative overflow-hidden py-12 text-cream md:py-14"
      style={{ background: 'linear-gradient(180deg, #0F7A34 0%, #0B652B 55%, #074D21 100%)' }}
    >
      {/* soft light falling from the top left, then Kente weave at 4%, felt more than seen */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 70% at 20% 35%, rgba(80,200,120,0.2), transparent 70%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: kenteDataUri, backgroundSize: '128px 48px' }} />
      <div className="container-site relative grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <SectionHeading eyebrow="Wherever you are" title="Delivery & Pickup" dark size="sm" className="!mb-0 lg:col-span-4" />
        <div className="grid gap-5 md:grid-cols-2 lg:col-span-8">
          {ITEMS.map((it, i) => (
            <motion.article
              key={it.title}
              className="relative overflow-hidden rounded-2xl border border-gold/50 bg-ink/30 p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur-[2px] md:p-8"
              initial={{ opacity: 0, x: it.from }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 1.1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <span aria-hidden="true" className="absolute inset-[6px] rounded-[13px] border border-dashed border-cream/15" />
              <div className="relative flex items-end justify-between gap-4">
                {it.art}
                <p className="accent text-xl text-gold-light">{it.label}</p>
              </div>
              <h3 className="relative mt-5 font-serif text-[1.75rem] font-semibold leading-tight md:text-[2.1rem]">{it.title}</h3>
              <p className="relative mt-3 text-[16px] leading-[1.75] text-cream/85">{it.text}</p>
              {it.link && (
                <a
                  href={it.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-4 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-gold underline decoration-gold/50 underline-offset-[6px] transition-colors hover:text-gold-light hover:decoration-gold-light"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" /> {it.link.label}
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
