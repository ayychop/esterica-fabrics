import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageIntro from '../components/shop/PageIntro'
import { TierBadge } from '../components/shop/ProductCard'
import { Stepper } from '../components/shop/QuantitySelector'
import WeaveDivider from '../components/WeaveDivider'
import { Photo, ArrowIcon, BagIcon, WhatsAppIcon } from '../components/ui'
import { Link } from '../lib/router'
import { useCart } from '../lib/cart'
import { orderMessage } from '../lib/order'
import { FREE_SHIPPING_FROM, MAX_CART_METRES, SHIPPING, TRADE_MIN, deliveryWindow, metresLabel, money, percent, perMetreLabel } from '../lib/pricing'
import { img, whatsappLink } from '../config'

// Shared with checkout: the two ways to get the cloth.
export function ShippingOptions({ cart, country = 'GB', name = 'shipping', light = false }) {
  const options = [
    {
      key: 'standard',
      title: country === 'GB' ? SHIPPING.standard.label : 'Post to Ireland',
      price: country !== 'GB' ? 'Quoted' : cart.subtotal >= FREE_SHIPPING_FROM ? 'Free' : money(SHIPPING.standard.price),
      note: country === 'GB' ? `${SHIPPING.standard.eta}, est. ${deliveryWindow()}` : 'We confirm Irish postage with you on WhatsApp',
    },
    { key: 'collect', title: SHIPPING.collect.label, price: 'Free', note: 'Access Self Storage, First Way, Wembley. Mon to Fri, 11am to 5pm' },
  ]
  return (
    <fieldset>
      <legend className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${light ? 'text-charcoal/70' : 'text-gold'}`}>Delivery</legend>
      <div className="grid gap-2">
        {options.map((o) => {
          const on = cart.method === o.key
          return (
            <label
              key={o.key}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                on ? (light ? 'border-charcoal bg-gold/15' : 'border-gold bg-gold/10') : light ? 'border-charcoal/25 hover:border-charcoal/60' : 'border-cream/25 hover:border-cream/50'
              }`}
            >
              <input type="radio" name={name} value={o.key} checked={on} onChange={() => cart.setShipping(o.key)} className="mt-1 h-4 w-4 accent-[#E8B31A]" />
              <span className="flex-1">
                <span className="flex justify-between gap-3 text-[15px] font-semibold">
                  {o.title}
                  <span className={o.price === 'Free' ? (light ? 'text-forest' : 'text-[#4FD97E]') : ''}>{o.price}</span>
                </span>
                <span className={`mt-1 block text-[13px] leading-snug ${light ? 'text-charcoal/65' : 'text-cream/65'}`}>{o.note}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FreeShippingBar({ subtotal }) {
  const left = FREE_SHIPPING_FROM - subtotal
  const progress = Math.min(1, subtotal / FREE_SHIPPING_FROM)
  return (
    <div>
      <p className="text-[14px] text-cream/85">
        {left > 0 ? (
          <>
            Add <strong className="text-gold">{money(left)}</strong> more for free UK delivery.
          </>
        ) : (
          <>You have free UK delivery.</>
        )}
      </p>
      <div className="mt-2 h-2.5 overflow-hidden bg-cream/15" role="progressbar" aria-label="Progress to free UK delivery" aria-valuemin={0} aria-valuemax={75} aria-valuenow={Math.min(75, Math.round(subtotal / 100))}>
        <motion.div
          className="h-full origin-left"
          style={{ background: 'repeating-linear-gradient(90deg, #E8B31A 0 18px, #C41E1E 18px 22px, #E8B31A 22px 40px, #0F7A34 40px 44px)' }}
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export function Totals({ cart, shipping = cart.shipping }) {
  const total = cart.subtotal + (shipping ?? 0)
  return (
    <dl className="grid gap-2.5 text-[15px]">
      <div className="flex justify-between gap-4">
        <dt className="text-cream/75">Fabric</dt>
        <dd>{money(cart.gross)}</dd>
      </div>
      {cart.discount > 0 && (
        <div className="flex justify-between gap-4 text-[#4FD97E]">
          <dt>Bulk savings</dt>
          <dd>-{money(cart.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-cream/75">Delivery</dt>
        <dd>{shipping === null ? 'Quoted on WhatsApp' : shipping === 0 ? 'Free' : money(shipping)}</dd>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-dashed border-cream/25 pt-4">
        <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-gold">Total</dt>
        <dd className="font-serif text-[2.1rem] font-semibold leading-none">{money(total)}</dd>
      </div>
      {shipping === null && <p className="text-right text-[12px] text-cream/60">plus postage</p>}
    </dl>
  )
}

function Line({ line, onMetres, onRemove }) {
  const { product } = line
  const href = `/shop/${product.slug}`
  return (
    <motion.li
      layout
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      className="grid grid-cols-[88px_1fr] gap-4 border-b border-dashed border-charcoal/25 py-6 sm:grid-cols-[120px_1fr] sm:gap-6"
    >
      <Link to={href} className="block" tabIndex={-1} aria-hidden="true">
        <Photo className="aspect-[4/5] w-full" src={img(product.imageId, 240, 300)} alt="" />
      </Link>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <TierBadge product={product} />
          <h2 className="mt-2 font-serif text-[1.4rem] font-semibold leading-tight">
            <Link to={href} className="hover:text-crimson">{product.name}</Link>
          </h2>
          <p className="mt-1 text-[14px] text-charcoal/70">{perMetreLabel(product.perMetre)} per metre</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Stepper value={line.metres} onChange={onMetres} max={MAX_CART_METRES} label={`Metres of ${product.name}`} size="sm" />
            <button type="button" onClick={onRemove} className="text-[13px] font-semibold text-charcoal/60 underline underline-offset-4 hover:text-crimson">
              Remove
            </button>
          </div>
          {line.metres >= MAX_CART_METRES && (
            <p className="mt-2 text-[13px] text-crimson">For {TRADE_MIN}m or more, ask for trade pricing on WhatsApp.</p>
          )}
        </div>
        <div className="sm:text-right">
          <p className="font-serif text-[1.5rem] font-semibold leading-none">{money(line.total)}</p>
          {line.discount > 0 && (
            <p className="mt-1.5 text-[13px]">
              <span className="text-charcoal/50 line-through">{money(line.gross)}</span>{' '}
              <span className="font-semibold text-forest">{percent(line.rate)} off</span>
            </p>
          )}
          <p className="mt-1 text-[13px] text-charcoal/60">{metresLabel(line.metres)} × {perMetreLabel(product.perMetre)}</p>
        </div>
      </div>
    </motion.li>
  )
}

export default function CartPage() {
  const cart = useCart()

  useEffect(() => {
    document.title = 'Your Cart | Esterica Fabrics'
  }, [])

  return (
    <>
      <PageIntro eyebrow="Your order" title="Your Cart" crumbs={[{ label: 'Shop', to: '/shop' }, { label: 'Cart' }]} />
      <WeaveDivider from="#121212" to="#FAF4E4" palette="bold" />

      <section className="bg-cream pb-16 pt-6 md:pb-24 md:pt-10">
        <div className="container-site">
          {cart.count === 0 ? (
            <div className="mx-auto max-w-lg py-12 text-center">
              <BagIcon className="mx-auto h-12 w-12 text-gold-dark" />
              <p className="mt-5 font-serif text-3xl font-semibold">Your cart is empty</p>
              <p className="accent mt-2 text-xl text-charcoal/70">Every cloth tells a story. Find yours.</p>
              <Link to="/shop" className="btn-gold mt-8">
                Browse the shop <ArrowIcon />
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <ul aria-label="Items in your cart" className="border-t border-dashed border-charcoal/25">
                  <AnimatePresence initial={false}>
                    {cart.lines.map((l) => (
                      <Line key={l.slug} line={l} onMetres={(m) => cart.setMetres(l.slug, m)} onRemove={() => cart.remove(l.slug)} />
                    ))}
                  </AnimatePresence>
                </ul>
                <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-crimson hover:text-charcoal">
                  <ArrowIcon className="h-4 w-4 rotate-180" /> Continue shopping
                </Link>
              </div>

              <aside className="lg:col-span-5" aria-label="Order summary">
                <div className="grid gap-6 bg-charcoal p-6 text-cream md:p-8 lg:sticky lg:top-28">
                  <h2 className="font-serif text-[1.8rem] font-semibold leading-none">Summary</h2>
                  {cart.method === 'standard' && <FreeShippingBar subtotal={cart.subtotal} />}
                  <ShippingOptions cart={cart} />
                  <Totals cart={cart} />
                  <Link to="/checkout" className="btn-gold min-h-[58px] w-full">
                    Proceed to Checkout <ArrowIcon />
                  </Link>
                  <div className="border-t border-dashed border-cream/25 pt-5">
                    <p className="accent text-[1.35rem] text-cream/85">Prefer to order on WhatsApp?</p>
                    <a
                      href={whatsappLink(orderMessage(cart))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-light mt-3 w-full"
                    >
                      <WhatsAppIcon /> Send this cart on WhatsApp
                    </a>
                  </div>
                  <p className="text-[12px] leading-relaxed text-cream/55">Posting to Ireland? Choose your country at checkout and we will quote postage.</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
      <WeaveDivider from="#FAF4E4" to="#0A0A0A" />
    </>
  )
}
