import { useEffect, useState } from 'react'
import { BagIcon, CheckIcon } from '../ui'
import { Link } from '../../lib/router'
import { useCart } from '../../lib/cart'
import { productImg, productSrcSet } from '../../data/products'
import { perMetreLabel } from '../../lib/pricing'

const WIDTHS = [480, 720, 960, 1280]

// The shop's editorial card: the cloth is the whole card, the words sit quietly underneath.
// `index` offsets each cloth's breathing so neighbours never move in step.
export default function FabricCard({ product, index = 0, eager = false, sizes = '(min-width: 768px) 46vw, 100vw' }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(t)
  }, [added])

  const href = `/shop/${product.slug}`
  return (
    <article className="fabric">
      <Link to={href} className="block" aria-label={`${product.name}, ${perMetreLabel(product.perMetre)} per metre`}>
        <div className="photo aspect-[4/5] w-full bg-sand">
          <div className="fabric-zoom absolute inset-0">
            <img
              src={productImg(product.image, 960, 1200)}
              srcSet={productSrcSet(product.image, WIDTHS, 1.25)}
              sizes={sizes}
              alt=""
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className="fabric-breathe h-full w-full object-cover"
              style={{ animationDelay: `${-index * 1.35}s` }}
            />
          </div>
        </div>
      </Link>

      <div className="mt-6 md:mt-8">
        <h3 className="font-serif text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1] tracking-[-0.01em] text-charcoal">
          <Link to={href} className="transition-colors duration-300 hover:text-crimson">{product.name}</Link>
        </h3>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/65">Sold by the metre</p>
        <div className="mt-5 flex items-center justify-between gap-4">
          {/* Gold on a solid ink block: the one place the price can be vivid gold and still be read on cream */}
          <p className="bg-ink px-3 py-1.5 font-serif text-[1.35rem] font-semibold leading-none text-gold md:text-[1.5rem]">
            {perMetreLabel(product.perMetre)}
            <span className="ml-1 font-sans text-[12px] font-semibold text-gold/80">/m</span>
          </p>
          <button
            type="button"
            onClick={() => {
              add(product.slug, 1)
              setAdded(true)
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 border-b-2 text-[12px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
              added ? 'border-forest text-forest' : 'border-charcoal text-charcoal hover:border-crimson hover:text-crimson'
            }`}
            aria-label={`Add 1 metre of ${product.name} to cart`}
          >
            {added ? <CheckIcon /> : <BagIcon className="h-[17px] w-[17px]" />}
            {added ? 'Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
