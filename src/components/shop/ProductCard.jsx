import { useEffect, useState } from 'react'
import { Photo, BagIcon, CheckIcon } from '../ui'
import { Link } from '../../lib/router'
import { useCart } from '../../lib/cart'
import { productImg } from '../../data/products'
import { perMetreLabel } from '../../lib/pricing'

// Each price tier wears its own solid Kente colour.
export const TIER_STYLE = {
  budget: 'bg-forest text-cream',
  standard: 'bg-indigo text-cream',
  premium: 'bg-crimson text-cream',
  designer: 'bg-gold text-ink',
}

export function TierBadge({ product, className = '' }) {
  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.2em] ${TIER_STYLE[product.tier]} ${className}`}>
      {product.tierLabel}
    </span>
  )
}

export default function ProductCard({ product, dark = false, eager = false }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(t)
  }, [added])

  const href = `/shop/${product.slug}`
  return (
    <article className="swatch group flex h-full flex-col">
      <Link to={href} className="block" aria-label={`${product.name}, ${product.tierLabel}, ${perMetreLabel(product.perMetre)} per metre`}>
        <div className="swatch-cloth relative shadow-[0_22px_40px_-20px_rgba(10,10,10,0.55)]">
          <Photo className="aspect-[4/5] w-full" src={productImg(product.image, 560, 700)} alt="" loading={eager ? 'eager' : 'lazy'} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
            <div className="swatch-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cream/30 to-transparent" />
          </div>
          <TierBadge product={product} className="absolute left-0 top-3 z-[3]" />
        </div>
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className={`font-serif text-[1.3rem] font-semibold leading-tight md:text-[1.4rem] ${dark ? 'text-cream' : 'text-charcoal'}`}>
          <Link to={href} className="transition-colors hover:text-crimson">{product.name}</Link>
        </h3>
        <p className={`mt-1.5 text-[15px] ${dark ? 'text-cream/80' : 'text-charcoal/75'}`}>
          <span className={`font-serif text-[1.2rem] font-semibold ${dark ? 'text-gold' : 'text-charcoal'}`}>{perMetreLabel(product.perMetre)}</span> per metre
        </p>
        <button
          type="button"
          onClick={() => {
            add(product.slug, 1)
            setAdded(true)
          }}
          className={`btn mt-4 !min-h-[46px] w-full !px-4 !text-[12px] ${
            added ? 'bg-forest text-cream' : dark ? 'bg-gold text-ink hover:bg-gold-light' : 'bg-charcoal text-cream hover:bg-gold hover:text-ink'
          }`}
          aria-label={`Add 1 metre of ${product.name} to cart`}
        >
          {added ? <CheckIcon /> : <BagIcon className="h-[18px] w-[18px]" />}
          {added ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
