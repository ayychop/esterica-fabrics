import { motion } from 'framer-motion'
import { Reveal, PinIcon, WhatsAppIcon, ArrowIcon } from './ui'
import { useConsent } from '../lib/consent'
import OpenBadge from './OpenBadge'
import { DIRECTIONS_URL, MAPS_URL, MAP_EMBED_URL, PHONE_DISPLAY, PHONE_TEL, whatsappLink } from '../config'

// Line drawing of the streets, shown until the visitor chooses to load Google Maps.
function MapSketch() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" fill="none">
      <rect width="800" height="400" fill="#F3E9D2" />
      <g stroke="#121212" strokeOpacity="0.12" strokeWidth="14" strokeLinecap="round">
        <path d="M-20 270 C 200 240, 420 300, 820 230" />
        <path d="M360 -20 C 380 130, 330 260, 400 420" />
      </g>
      <g stroke="#121212" strokeOpacity="0.1" strokeWidth="5">
        <path d="M-20 110 L 820 150" />
        <path d="M120 -20 L 190 420" />
        <path d="M600 -20 C 560 160, 640 260, 590 420" />
      </g>
      <path d="M220 270 C 320 262, 360 245, 470 205" stroke="#C41E1E" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" />
      <circle cx="470" cy="205" r="34" fill="#E8B31A" fillOpacity="0.25" />
      <circle cx="470" cy="205" r="9" fill="#C41E1E" />
    </svg>
  )
}

function MapPanel() {
  const { consent, setConsent } = useConsent()
  if (consent === 'accepted') {
    return (
      <iframe
        title="Map showing Esterica Fabrics at Access Self Storage, First Way, Wembley"
        src={MAP_EMBED_URL}
        // shifted up inside the frame so Google's place card is cropped; its attribution stays visible at the bottom
        className="absolute inset-x-0 -top-[72px] h-[calc(100%+72px)] w-full border-0"
        style={{ filter: 'sepia(0.12) saturate(1.05)' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }
  return (
    <>
      <MapSketch />
      <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl bg-cream/90 px-5 py-3 shadow-lg backdrop-blur-sm">
        <p className="flex items-center gap-2 text-sm text-charcoal/75">
          <PinIcon className="h-4 w-4 text-crimson" /> Google Maps uses cookies. Load the live map?
        </p>
        <button type="button" onClick={() => setConsent('accepted')} className="text-xs font-bold uppercase tracking-[0.2em] text-crimson underline decoration-dashed underline-offset-[6px] hover:text-gold-dark">
          Show map
        </button>
      </div>
    </>
  )
}

const cell = { hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }
const label = 'text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-dark'
const big = 'mt-3 font-serif text-[1.3rem] leading-snug text-charcoal sm:text-[1.6rem] md:text-[1.9rem]'

export default function Visit() {
  return (
    <section id="visit" className="section-pad relative overflow-hidden bg-cream">
      <div className="container-site">
        <Reveal className="text-center">
          <p className="eyebrow justify-center text-gold-dark">Come and feel the cloth</p>
          <h2 className="heading-depth font-serif text-[clamp(2.6rem,5.5vw,4.4rem)] font-semibold leading-none text-charcoal">Visit Us</h2>
          <p className="accent mt-3 text-[1.5rem] text-charcoal/75">Pop in during opening hours. No appointment needed.</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 flex justify-center">
          <OpenBadge />
        </Reveal>

        <motion.dl
          className="mt-7 grid grid-cols-1 border-y border-charcoal/15 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div variants={cell} className="py-5 sm:col-span-2 lg:col-span-1 lg:px-8 lg:py-7 lg:text-center">
            <dt className={label}>Address</dt>
            <dd className={big}>
              Access Self Storage
              <br />
              First Way, Wembley
              <br />
              <span className="text-crimson">Unit 5580</span>
            </dd>
          </motion.div>
          <motion.div variants={cell} className="border-t border-charcoal/15 py-5 lg:border-l lg:border-t-0 lg:px-8 lg:py-7 lg:text-center">
            <dt className={label}>Opening hours</dt>
            <dd className={big}>
              Monday to Friday
              <br />
              11:00am to 5:00pm
            </dd>
            <dd className="mt-1 text-sm text-charcoal/55">Closed weekends</dd>
          </motion.div>
          <motion.div variants={cell} className="border-t border-charcoal/15 py-5 sm:border-l sm:pl-6 lg:border-t-0 lg:px-8 lg:py-7 lg:text-center">
            <dt className={label}>Phone and WhatsApp</dt>
            <dd className={big}>
              <a href={`tel:${PHONE_TEL}`} className="whitespace-nowrap transition-colors hover:text-crimson">
                {PHONE_DISPLAY}
              </a>
            </dd>
            <dd className="mt-1 text-sm text-charcoal/55">We reply quickest on WhatsApp</dd>
          </motion.div>
        </motion.dl>

        <Reveal className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-outline-dark">
            Get Directions <ArrowIcon />
          </a>
          <a href={whatsappLink("Hi Esterica Fabrics, I'm planning to visit your Wembley unit. Could you confirm you're open?")} target="_blank" rel="noopener noreferrer" className="btn-gold">
            <WhatsAppIcon /> WhatsApp Us
          </a>
        </Reveal>

        {/* The map: framed in gold, captioned, faded softly into the section from the top */}
        <Reveal className="mt-8">
          <div className="overflow-hidden rounded-[22px] border-2 border-gold bg-cream shadow-[0_30px_60px_-30px_rgba(10,10,10,0.45)]">
            <div className="flex items-center justify-between gap-4 bg-cream px-5 py-3">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-charcoal md:text-[12px]">
                <PinIcon className="h-4 w-4 text-crimson" /> Esterica Fabrics · Unit 5580
              </p>
              <p className="accent hidden text-lg text-charcoal/60 sm:block">First Way, Wembley</p>
            </div>
            <div className="relative h-[260px] md:h-[400px]">
              <MapPanel />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-cream to-transparent" />
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-gold bg-charcoal/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold shadow-[0_10px_24px_-10px_rgba(10,10,10,0.6)] backdrop-blur-sm transition-colors hover:bg-gold hover:text-ink"
              >
                <PinIcon className="h-3.5 w-3.5" /> Open in Google Maps
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
