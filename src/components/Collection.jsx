import { useEffect, useRef, useState } from 'react'
import { SectionHeading, Photo, Reveal, ArrowIcon, BagIcon, WhatsAppIcon } from './ui'
import { img, whatsappLink } from '../config'
import { PRODUCTS as FABRICS } from '../data/products'
import { perMetreLabel } from '../lib/pricing'
import { Link } from '../lib/router'

// Each cloth is laid down by hand, so each sits at its own slight angle.
const ANGLES = [-3, 2.5, -2, 4, 3, -4, 2, -2.5]

function Swatch({ fabric, index }) {
  const href = `/shop/${fabric.slug}`
  return (
    <Reveal as="article" y={40} delay={(index % 4) * 0.08} className={`swatch w-[68%] shrink-0 snap-center sm:w-[44%] md:w-auto ${index % 2 ? 'md:mt-16' : ''}`}>
      <div className="px-1.5 pt-1.5" style={{ transform: `rotate(${ANGLES[index % ANGLES.length]}deg)` }}>
        <div className="swatch-cloth relative shadow-[0_22px_40px_-18px_rgba(10,10,10,0.55),0_6px_12px_-6px_rgba(10,10,10,0.25)]">
          <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
            <Photo className="aspect-[4/5] w-full" src={img(fabric.imageId, 520, 650)} alt={`${fabric.name} Kente cloth`} />
          </Link>
          {/* light catching the cloth when touched */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
            <div className="swatch-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cream/30 to-transparent" />
          </div>
        </div>
      </div>
      <div className="mt-6 px-1">
        <h3 className="font-serif text-xl font-semibold leading-tight text-charcoal md:text-[1.4rem]">{fabric.name}</h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal/55">
          <span className="font-serif text-[15px] normal-case tracking-normal text-charcoal">{perMetreLabel(fabric.perMetre)}</span> per metre
        </p>
        <Link
          to={href}
          className="group/link mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-crimson transition-colors hover:text-charcoal"
          aria-label={`Shop ${fabric.name}`}
        >
          Shop this cloth <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </Reveal>
  )
}

export default function Collection() {
  const railRef = useRef(null)
  const [active, setActive] = useState(0)

  // Which swatch is centred in the phone rail, for the dots.
  useEffect(() => {
    const rail = railRef.current
    if (!rail || window.matchMedia('(min-width: 768px)').matches) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive([...rail.children].indexOf(e.target))),
      { root: rail, threshold: 0.6 },
    )
    ;[...rail.children].forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  return (
    <section id="collection" className="section-pad relative bg-cream">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <SectionHeading eyebrow="Sold by the metre" title="The Collection" className="!mb-0 lg:col-span-6" />
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <p className="accent text-[1.7rem] leading-snug text-charcoal/85">Every cloth tells a story. Every metre is unique.</p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-charcoal/65">
              No two bolts are alike. Every cloth is priced by the metre in the shop, from everyday prints to designer weaves, with bulk savings from 5 metres.
            </p>
          </Reveal>
        </div>

        {/* Phones: a swipeable rail with snap points. Tablet and desktop: the four column layout. */}
        <div
          ref={railRef}
          className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[16%] pb-4 pt-2 sm:-mx-8 sm:px-8 md:mx-0 md:mt-20 md:grid md:snap-none md:grid-cols-4 md:gap-x-10 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0"
          aria-label="Fabric collection"
        >
          {FABRICS.map((f, i) => (
            <Swatch key={f.name} fabric={f} index={i} />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-4 md:hidden" aria-hidden="true">
          <div className="flex gap-1.5">
            {FABRICS.map((f, i) => (
              <span key={f.name} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-gold-dark' : 'w-1.5 bg-charcoal/20'}`} />
            ))}
          </div>
          <span className="accent text-lg text-charcoal/55">Swipe →</span>
        </div>

        <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row md:mt-12">
          <Link to="/shop" className="btn-gold">
            <BagIcon /> Shop the full collection
          </Link>
          <a href={whatsappLink("Hi Esterica Fabrics, I'd like to ask what's in stock at the moment.")} target="_blank" rel="noopener noreferrer" className="btn-outline-dark">
            <WhatsAppIcon /> Ask what's in stock
          </a>
        </Reveal>
      </div>
    </section>
  )
}
