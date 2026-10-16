import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProductCard, { TierBadge } from '../components/shop/ProductCard'
import QuantitySelector from '../components/shop/QuantitySelector'
import WeaveDivider from '../components/WeaveDivider'
import { Photo, Reveal, BagIcon, PinIcon, StarIcon, TruckIcon, WhatsAppIcon } from '../components/ui'
import { TRADE_MESSAGE } from '../components/Trade'
import { Link } from '../lib/router'
import { useCart } from '../lib/cart'
import { COLOURS, OCCASIONS, PATTERNS, VIEWS, relatedTo, viewSrc } from '../data/products'
import { SHIPPING, TRADE_MIN, metresLabel, money, nextBand, percent, perMetreLabel, priceLine } from '../lib/pricing'
import { whatsappLink } from '../config'

function Gallery({ product }) {
  const [index, setIndex] = useState(0)
  const go = (d) => setIndex((i) => (i + d + VIEWS.length) % VIEWS.length)
  const arrow = 'absolute top-1/2 z-[3] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-charcoal/85 text-gold transition-colors hover:bg-gold hover:text-ink'

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-[4/5] overflow-hidden bg-charcoal shadow-[0_30px_60px_-30px_rgba(10,10,10,0.6)]">
        <AnimatePresence initial={false}>
          <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <Photo
              className="h-full w-full"
              src={viewSrc(product.imageId, VIEWS[index], 1000, 1250)}
              alt={`${product.name}, ${VIEWS[index].label.toLowerCase()}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </motion.div>
        </AnimatePresence>
        <button type="button" className={`${arrow} left-3`} onClick={() => go(-1)} aria-label="Previous image">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" className={`${arrow} right-3`} onClick={() => go(1)} aria-label="Next image">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <p className="absolute bottom-3 left-3 z-[3] bg-charcoal/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream" aria-live="polite">
          {VIEWS[index].label} <span className="text-gold">{index + 1}/{VIEWS.length}</span>
        </p>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 md:gap-3">
        {VIEWS.map((v, i) => (
          <button
            key={v.label}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${v.label.toLowerCase()}`}
            aria-pressed={i === index}
            className={`relative aspect-square overflow-hidden outline-offset-2 transition-opacity ${i === index ? 'ring-[3px] ring-gold' : 'opacity-70 hover:opacity-100'}`}
          >
            <Photo className="h-full w-full" src={viewSrc(product.imageId, v, 200, 200)} alt="" />
          </button>
        ))}
      </div>
    </div>
  )
}

function Rating() {
  return (
    <p className="flex items-center gap-2 text-[14px] text-charcoal/75">
      <span className="flex text-gold-dark" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className="h-4 w-4" />)}
      </span>
      <span>
        Rated <strong className="text-charcoal">4.8</strong> by tailors and designers
      </span>
    </p>
  )
}

export default function ProductPage({ product }) {
  const { add } = useCart()
  const [metres, setMetres] = useState(2)
  const isTrade = metres >= TRADE_MIN
  const price = priceLine(product.perMetre, metres)
  const next = nextBand(metres)

  useEffect(() => {
    document.title = `${product.name}, ${product.tierLabel} by the Metre | Esterica Fabrics`
  }, [product])

  const waMessage = `Hi Esterica Fabrics, I'd like to order ${metresLabel(metres)} of ${product.name} (${product.tierLabel}, ${perMetreLabel(product.perMetre)} per metre). The website shows ${money(price.total)}${
    price.discount ? ` after the ${percent(price.rate)} bulk discount` : ''
  }. Is it available?`

  const details = [
    ['Origin', product.origin],
    ['Pattern', PATTERNS[product.pattern]],
    ['Colours', product.colours.map((c) => COLOURS[c].label).join(', ')],
    ['Best for', product.occasions.map((o) => OCCASIONS[o]).join(', ')],
    ['Sold by', 'The metre, cut to length in half metres'],
  ]

  return (
    <>
      <section className="bg-cream pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-charcoal/60 md:mb-8">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/shop" className="transition-colors hover:text-crimson">Shop</Link></li>
              <li aria-hidden="true" className="text-gold-dark">/</li>
              <li aria-current="page" className="text-charcoal">{product.name}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <Gallery key={product.slug} product={product} />
            </div>

            <div className="lg:col-span-5">
              <TierBadge product={product} />
              <h1 className="heading-depth mt-4 font-serif text-[clamp(2.5rem,5vw,3.8rem)] font-semibold leading-[0.98] text-charcoal">{product.name}</h1>
              <p className="mt-3 flex items-start gap-2 text-[15px] text-charcoal/75">
                <PinIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-crimson" /> {product.origin}
              </p>
              <div className="mt-4"><Rating /></div>

              <p className="mt-7 flex items-baseline gap-3 border-y border-dashed border-charcoal/25 py-5">
                <span className="font-serif text-[3.4rem] font-bold leading-none text-charcoal md:text-[4rem]">{perMetreLabel(product.perMetre)}</span>
                <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-charcoal/70">per metre</span>
              </p>

              <p className="mt-6 text-[16px] leading-[1.75] text-charcoal/80">{product.blurb}</p>

              <div className="mt-8">
                <QuantitySelector value={metres} onChange={setMetres} />
              </div>

              <div className="mt-7 bg-charcoal p-5 text-cream md:p-6" aria-live="polite">
                {isTrade ? (
                  <>
                    <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-gold">Trade order</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-cream/85">
                      {metresLabel(metres)} is a trade sized order. Orders of {TRADE_MIN} metres or more are priced individually, so message us for a trade price.
                    </p>
                  </>
                ) : (
                  <dl className="grid gap-2 text-[15px]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-cream/75">{metresLabel(metres)} × {perMetreLabel(product.perMetre)}</dt>
                      <dd>{money(price.gross)}</dd>
                    </div>
                    {price.discount > 0 && (
                      <div className="flex justify-between gap-4 text-[#4FD97E]">
                        <dt>Bulk discount {percent(price.rate)}</dt>
                        <dd>-{money(price.discount)}</dd>
                      </div>
                    )}
                    <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-dashed border-cream/25 pt-3">
                      <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-gold">Total</dt>
                      <dd className="font-serif text-[2rem] font-semibold leading-none">{money(price.total)}</dd>
                    </div>
                    {next && (
                      <p className="mt-1 text-[13px] text-gold-light">
                        Buy {metresLabel(next.min)} or more and save {percent(next.rate)}.
                      </p>
                    )}
                  </dl>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {isTrade ? (
                  <a href={whatsappLink(TRADE_MESSAGE.replace('Fabric(s):', `Fabric(s): ${product.name}`).replace('Metres:', `Metres: ${metres}`))} target="_blank" rel="noopener noreferrer" className="btn-gold min-h-[58px] sm:col-span-2">
                    <WhatsAppIcon /> Enquire for trade pricing
                  </a>
                ) : (
                  <>
                    <button type="button" onClick={() => add(product.slug, metres)} className="btn-gold min-h-[58px] shadow-[0_18px_36px_-16px_rgba(148,107,0,0.7)]">
                      <BagIcon /> Add to Cart
                    </button>
                    <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="btn-outline-dark min-h-[58px] !px-5">
                      <WhatsAppIcon /> Order via WhatsApp
                    </a>
                  </>
                )}
              </div>

              <p className="mt-5 flex items-start gap-3 text-[14px] leading-relaxed text-charcoal/75">
                <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                <span>
                  UK delivery in {SHIPPING.standard.eta}, {money(SHIPPING.standard.price)} or free over £75. Free Click & Collect from Wembley. Ireland postage quoted with your order.
                </span>
              </p>

              <dl className="mt-8 border-t border-dashed border-charcoal/25">
                {details.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-dashed border-charcoal/25 py-3 text-[14px]">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal/60">{k}</dt>
                    <dd className="text-charcoal/85">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <WeaveDivider from="#FAF4E4" to="#121212" palette="bold" />
      <section className="section-pad bg-charcoal" aria-labelledby="related-title">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow text-gold">Pairs well with</p>
            <h2 id="related-title" className="heading-depth-dark font-serif text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-none text-cream">Related fabrics</h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {relatedTo(product).map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.08}>
                <ProductCard product={p} dark />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <WeaveDivider from="#121212" to="#0A0A0A" />
    </>
  )
}
