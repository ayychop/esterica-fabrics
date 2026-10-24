import { useEffect, useState } from 'react'
import { ArrowIcon, BagIcon, CheckIcon } from '../ui'
import { Link } from '../../lib/router'
import { useCart } from '../../lib/cart'
import { productImg, productSrcSet } from '../../data/products'
import { perMetreLabel } from '../../lib/pricing'

const WIDTHS = [480, 720, 960, 1280, 1600]

// A campaign tile for the shop: the cloth fills the frame and the words sit on it, bottom left, over a
// dark scrim that deepens on hover. "Shop this cloth" waits for a hover on desktop and is always shown on touch.
// `big` tiles are the 60% frames of the editorial grid; the rest are the 40% frames.
export default function CampaignTile({ product, big = false, index = 0, eager = false, sizes }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(t)
  }, [added])

  const href = `/shop/${product.slug}`
  const ratio = big ? 1.25 : 4 / 3
  return (
    <article className="tile relative">
      <Link to={href} className="block" aria-label={`${product.name}, ${perMetreLabel(product.perMetre)} per metre`}>
        <div className={`photo w-full bg-charcoal ${big ? 'aspect-[4/5]' : 'aspect-[4/5] md:aspect-[3/4]'}`}>
          <div className="tile-zoom absolute inset-0">
            <img
              src={productImg(product.image, 1280, Math.round(1280 * ratio))}
              srcSet={productSrcSet(product.image, WIDTHS, ratio)}
              sizes={sizes ?? (big ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 38vw, 100vw')}
              alt=""
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className="fabric-breathe h-full w-full object-cover"
              style={{ animationDelay: `${-index * 1.35}s` }}
            />
          </div>
          <div aria-hidden="true" className="tile-scrim pointer-events-none absolute inset-0 z-[2]" />

          <div className="absolute inset-x-0 bottom-0 z-[3] p-5 pr-20 md:p-8 md:pr-24">
            <h3 className="text-[clamp(0.95rem,1.5vw,1.35rem)] font-semibold uppercase leading-tight tracking-[0.22em] text-cream">{product.name}</h3>
            <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-gold md:text-[14px]">
              {perMetreLabel(product.perMetre)} <span className="text-cream/80">/ metre</span>
            </p>
            <span className="tile-cta mt-4 inline-flex items-center gap-2 border-b border-cream/60 pb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-cream">
              Shop this cloth <ArrowIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* Quick add sits outside the link, so a tap here never opens the product page */}
      <button
        type="button"
        onClick={() => {
          add(product.slug, 1)
          setAdded(true)
        }}
        aria-label={`Add 1 metre of ${product.name} to cart`}
        className={`absolute bottom-5 right-5 z-[4] grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300 md:bottom-8 md:right-8 ${
          added ? 'border-forest bg-forest text-cream' : 'border-cream/60 bg-ink/40 text-cream backdrop-blur-sm hover:border-gold hover:bg-gold hover:text-ink'
        }`}
      >
        {added ? <CheckIcon /> : <BagIcon className="h-[18px] w-[18px]" />}
      </button>
    </article>
  )
}
