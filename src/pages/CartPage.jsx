import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageTitle from '../components/shop/PageTitle'
import { Stepper } from '../components/shop/QuantitySelector'
import WeaveDivider from '../components/WeaveDivider'
import { ArrowIcon, BagIcon, WhatsAppIcon } from '../components/ui'
import { Link } from '../lib/router'
import { useCart } from '../lib/cart'
import { orderMessage } from '../lib/order'
import { FREE_SHIPPING_FROM, MAX_CART_METRES, SHIPPING, TRADE_MIN, deliveryWindow, metresLabel, money, percent, perMetreLabel } from '../lib/pricing'
import { img, whatsappLink } from '../config'

const EASE = [0.22, 1, 0.36, 1]

// A choice drawn as a clean card. The real radio input stays in place for keyboards and screen readers.
export function RadioCard({ name, value, checked, onChange, disabled = false, dark = false, children }) {
  const tone = dark
    ? checked ? 'border-gold bg-gold/10' : 'border-cream/20 hover:border-cream/50'
    : checked ? 'border-charcoal bg-gold/20' : 'border-charcoal/20 hover:border-charcoal/60'
  return (
    <label
      className={`relative flex items-start gap-4 border p-4 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold md:p-5 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${disabled ? (dark ? 'border-cream/15' : 'border-charcoal/15') : tone}`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          checked ? (dark ? 'border-gold' : 'border-charcoal') : dark ? 'border-cream/40' : 'border-charcoal/35'
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full transition-transform duration-300 ${dark ? 'bg-gold' : 'bg-charcoal'} ${checked ? 'scale-100' : 'scale-0'}`} />
      </span>
      <span className="flex-1">{children}</span>
    </label>
  )
}

// Shared with checkout: the two ways to get the cloth.
export function ShippingOptions({ cart, country = 'GB', name = 'shipping', dark = false }) {
  const options = [
    {
      key: 'standard',
      title: country === 'GB' ? 'Standard UK' : 'Post to Ireland',
      price: country !== 'GB' ? 'Quoted' : cart.subtotal >= FREE_SHIPPING_FROM ? 'Free' : money(SHIPPING.standard.price),
      note: country === 'GB' ? `${SHIPPING.standard.eta}, est. ${deliveryWindow()}` : 'We confirm Irish postage with you on WhatsApp',
    },
    { key: 'collect', title: 'Click & Collect', price: 'Free', note: 'Wembley, Monday to Friday, 11am to 5pm' },
  ]
  return (
    <fieldset>
      <legend className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${dark ? 'text-cream/70' : 'text-charcoal/70'}`}>Delivery</legend>
      <div className="grid gap-2.5">
        {options.map((o) => (
          <RadioCard key={o.key} name={name} value={o.key} checked={cart.method === o.key} onChange={() => cart.setShipping(o.key)} dark={dark}>
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-semibold">{o.title}</span>
              <span className={`font-serif text-[1.15rem] font-semibold ${dark ? 'text-gold' : 'text-charcoal'}`}>{o.price}</span>
            </span>
            <span className={`mt-1 block text-[13px] leading-snug ${dark ? 'text-cream/65' : 'text-charcoal/65'}`}>{o.note}</span>
          </RadioCard>
        ))}
      </div>
    </fieldset>
  )
}

// Under £75: how far to free delivery, as a thin line slowly filling with gold.
export function FreeShippingBar({ subtotal }) {
  const left = FREE_SHIPPING_FROM - subtotal
  if (left <= 0) return <p className="text-[14px] font-semibold text-gold">Free UK delivery on this order.</p>
  return (
    <div>
      <p className="text-[14px] text-cream/85">
        <strong className="font-semibold text-gold">{money(left)}</strong> away from free UK delivery
      </p>
      <div
        className="mt-3 h-1 overflow-hidden bg-cream/15"
        role="progressbar"
        aria-label="Progress to free UK delivery"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_FROM / 100}
        aria-valuenow={Math.round(subtotal / 100)}
      >
        <motion.div
          className="h-full origin-left bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: subtotal / FREE_SHIPPING_FROM }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </div>
    </div>
  )
}

export function Totals({ cart, shipping = cart.shipping }) {
  const total = cart.subtotal + (shipping ?? 0)
  return (
    <dl className="grid gap-2.5 text-[15px]">
      {cart.discount > 0 && (
        <>
          <div className="flex justify-between gap-4">
            <dt className="text-cream/75">Fabric</dt>
            <dd>{money(cart.gross)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-[#4FD97E]">
            <dt>Bulk savings</dt>
            <dd>-{money(cart.discount)}</dd>
          </div>
        </>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-cream/75">Subtotal</dt>
        <dd>{money(cart.subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-cream/75">Shipping</dt>
        <dd>{shipping === null ? 'Quoted on WhatsApp' : shipping === 0 ? 'Free' : money(shipping)}</dd>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-cream/15 pt-4">
        <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-gold">Total</dt>
        <dd className="font-serif text-[2.4rem] font-semibold leading-none">{money(total)}</dd>
      </div>
      {shipping === null && <p className="text-right text-[12px] text-cream/60">plus postage</p>}
    </dl>
  )
}

function Line({ line, index, onMetres, onRemove }) {
  const { product } = line
  const href = `/shop/${product.slug}`
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.2 + index * 0.06, ease: EASE } }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      className="fabric grid grid-cols-[112px_1fr] gap-5 border-b border-charcoal/15 py-8 sm:grid-cols-[200px_1fr] sm:gap-8 md:py-10"
    >
      <Link to={href} className="block" tabIndex={-1} aria-hidden="true">
        <div className="photo aspect-[4/5] w-full bg-sand">
          <div className="fabric-zoom absolute inset-0">
            <img src={img(product.imageId, 400, 500)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
        </div>
      </Link>
      <div className="flex min-w-0 flex-col">
        <h2 className="font-serif text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-[1] tracking-[-0.01em]">
          <Link to={href} className="transition-colors hover:text-crimson">{product.name}</Link>
        </h2>
        <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal/65">
          {perMetreLabel(product.perMetre)} per metre
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Stepper value={line.metres} onChange={onMetres} max={MAX_CART_METRES} label={`Metres of ${product.name}`} size="sm" />
            <button type="button" onClick={onRemove} className="min-h-[40px] text-[12px] font-semibold uppercase tracking-[0.18em] text-charcoal/60 underline underline-offset-4 hover:text-crimson">
              Remove
            </button>
          </div>
          <div className="sm:text-right">
            <p className="font-serif text-[1.9rem] font-semibold leading-none">{money(line.total)}</p>
            <p className="mt-1.5 text-[13px] text-charcoal/65">
              {metresLabel(line.metres)} × {perMetreLabel(product.perMetre)}
              {line.discount > 0 && <span className="ml-2 font-semibold text-forest">{percent(line.rate)} off</span>}
            </p>
          </div>
        </div>
        {line.metres >= MAX_CART_METRES && (
          <p className="mt-3 text-[13px] text-crimson">For {TRADE_MIN}m or more, ask for trade pricing on WhatsApp.</p>
        )}
      </div>
    </motion.li>
  )
}

export default function CartPage() {
  const cart = useCart()

  useEffect(() => {
    document.title = 'Your Cart | Esterica Fabrics'
  }, [])

  const line = cart.count ? `${cart.count} ${cart.count === 1 ? 'cloth' : 'cloths'} · ${metresLabel(cart.metres)} in all` : null

  return (
    <>
      <section className="bg-cream pb-24 md:pb-36">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <PageTitle title="Your Cart" line={line} crumbs={[{ label: 'The Collection', to: '/shop' }, { label: 'Cart' }]} />

          {cart.count === 0 ? (
            <div className="border-t border-charcoal/15 py-16 md:py-24">
              <BagIcon className="h-10 w-10 text-charcoal/50" />
              <p className="accent mt-5 text-[clamp(1.6rem,3vw,2.2rem)] text-charcoal/80">Every cloth tells a story. Find yours.</p>
              <Link to="/shop" className="btn-gold mt-8">
                Browse the collection <ArrowIcon />
              </Link>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <ul aria-label="Items in your cart" className="border-t border-charcoal/15">
                  <AnimatePresence>
                    {cart.lines.map((l, i) => (
                      <Line key={l.slug} line={l} index={i} onMetres={(m) => cart.setMetres(l.slug, m)} onRemove={() => cart.remove(l.slug)} />
                    ))}
                  </AnimatePresence>
                </ul>
                <Link to="/shop" className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-crimson">
                  <ArrowIcon className="h-4 w-4 rotate-180" /> Continue shopping
                </Link>
              </div>

              <motion.aside
                className="lg:col-span-5"
                aria-label="Order summary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: EASE }}
              >
                <div className="grid gap-7 bg-charcoal p-6 text-cream sm:p-8 md:p-10 lg:sticky lg:top-28">
                  <h2 className="font-serif text-[2rem] font-semibold leading-none">Summary</h2>
                  {cart.method === 'standard' && <FreeShippingBar subtotal={cart.subtotal} />}
                  <ShippingOptions cart={cart} dark />
                  <Totals cart={cart} />
                  <div className="grid gap-4">
                    <Link to="/checkout" className="btn-gold min-h-[60px] w-full text-[15px]">
                      Proceed to Checkout <ArrowIcon />
                    </Link>
                    <a
                      href={whatsappLink(orderMessage(cart))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 text-[14px] text-cream/80 underline decoration-cream/30 underline-offset-[6px] transition-colors hover:text-gold hover:decoration-gold"
                    >
                      <WhatsAppIcon className="h-[18px] w-[18px]" /> Prefer to order on WhatsApp?
                    </a>
                  </div>
                  <p className="text-[12px] leading-relaxed text-cream/55">Posting to Ireland? Choose your country at checkout and we will quote postage. Anywhere else in the world, order on WhatsApp and we will quote shipping for your country.</p>
                </div>
              </motion.aside>
            </div>
          )}
        </div>
      </section>
      <WeaveDivider from="#FAF4E4" to="#0A0A0A" />
    </>
  )
}
