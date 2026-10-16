import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageIntro from '../components/shop/PageIntro'
import WeaveDivider from '../components/WeaveDivider'
import { ShippingOptions, Totals } from './CartPage'
import { Photo, ArrowIcon, BagIcon, WhatsAppIcon } from '../components/ui'
import { Link, useRouter } from '../lib/router'
import { useCart } from '../lib/cart'
import { orderMessage, orderRef } from '../lib/order'
import { COUNTRIES, metresLabel, money, shippingCost } from '../lib/pricing'
import { PHONE_DISPLAY, img, whatsappLink } from '../config'

export const CONFIRM_KEY = 'esterica-last-order'

const field = 'field border-charcoal/35 text-charcoal placeholder:text-charcoal/35'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-charcoal/70'

function Field({ id, label, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} className={field} {...props} />
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <fieldset className="border-t-2 border-charcoal pt-6">
      <legend className="float-left mb-6 flex w-full items-center gap-3">
        <span className="grid h-8 w-8 place-items-center bg-charcoal font-serif text-[1.05rem] font-bold text-gold">{n}</span>
        <span className="font-serif text-[1.6rem] font-semibold leading-none">{title}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  )
}

const PAYMENT_OPTIONS = [
  { key: 'whatsapp', title: 'Pay via WhatsApp', note: 'Your order opens in WhatsApp, ready to send. We reply with payment details.' },
  { key: 'card', title: 'Card', note: 'Visa, Mastercard and Apple Pay', soon: true },
]

// TODO: Integrate Stripe once shop owner approves the site.
// Until then the card option is shown but cannot be used; WhatsApp is the live way to order.
function PaymentStep({ method, onChange }) {
  return (
    <Step n="3" title="Payment">
      <div className="grid gap-2">
        {PAYMENT_OPTIONS.map((o) => {
          const on = method === o.key
          return (
            <label
              key={o.key}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${on ? 'border-charcoal bg-gold/15' : 'border-charcoal/25 hover:border-charcoal/60'}`}
            >
              <input type="radio" name="payment" value={o.key} checked={on} onChange={() => onChange(o.key)} className="mt-1 h-4 w-4 accent-[#121212]" />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                  {o.key === 'whatsapp' && <WhatsAppIcon className="h-[18px] w-[18px] text-forest" />}
                  {o.title}
                  {o.soon && <span className="bg-charcoal px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-gold">Coming Soon</span>}
                  {!o.soon && <span className="bg-forest px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-cream">Active</span>}
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-charcoal/65">{o.note}</span>
              </span>
            </label>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {method === 'card' && (
          <motion.p
            role="status"
            className="mt-4 border-l-4 border-crimson bg-crimson/10 p-4 text-[15px] leading-relaxed text-charcoal"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Card payments will be available once the shop goes live. For now, please order via WhatsApp.
          </motion.p>
        )}
      </AnimatePresence>
    </Step>
  )
}

export default function CheckoutPage() {
  const cart = useCart()
  const { navigate } = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', postcode: '', notes: '' })
  const [country, setCountry] = useState('GB')
  const [payment, setPayment] = useState('whatsapp')
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    document.title = 'Checkout | Esterica Fabrics'
  }, [])

  const shipping = shippingCost(cart.method, cart.subtotal, country)
  const posting = cart.method === 'standard'

  const submit = (e) => {
    e.preventDefault()
    if (payment !== 'whatsapp') return
    const ref = orderRef()
    const order = { ...cart, shipping, total: cart.subtotal + (shipping ?? 0) }
    const message = orderMessage(order, { ref, customer: form, country })
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer')
    const confirmation = { name: form.name.trim().split(/\s+/)[0], ref, message }
    try {
      sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(confirmation))
    } catch {
      /* the confirmation still arrives through history state */
    }
    cart.clear()
    navigate('/order-confirmed', { state: confirmation, replace: true })
  }

  if (cart.count === 0) {
    return (
      <>
        <PageIntro eyebrow="Checkout" title="Nothing to check out yet" crumbs={[{ label: 'Shop', to: '/shop' }, { label: 'Checkout' }]} />
        <WeaveDivider from="#121212" to="#FAF4E4" palette="bold" />
        <section className="bg-cream py-16 text-center">
          <BagIcon className="mx-auto h-12 w-12 text-gold-dark" />
          <p className="accent mt-4 text-2xl text-charcoal/75">Your cart is empty.</p>
          <Link to="/shop" className="btn-gold mt-8">
            Browse the shop <ArrowIcon />
          </Link>
        </section>
        <WeaveDivider from="#FAF4E4" to="#0A0A0A" />
      </>
    )
  }

  return (
    <>
      <PageIntro eyebrow="Almost yours" title="Checkout" crumbs={[{ label: 'Shop', to: '/shop' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <WeaveDivider from="#121212" to="#FAF4E4" palette="bold" />

      <section className="bg-cream pb-16 pt-8 md:pb-24 md:pt-12">
        <form onSubmit={submit} className="container-site grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="grid gap-10 lg:col-span-7">
            <Step n="1" title="Your details">
              <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                <Field id="co-name" label="Full name" required autoComplete="name" value={form.name} onChange={update('name')} className="sm:col-span-2" />
                <Field id="co-email" label="Email" type="email" required autoComplete="email" value={form.email} onChange={update('email')} />
                <Field id="co-phone" label="Phone" type="tel" required autoComplete="tel" value={form.phone} onChange={update('phone')} />
              </div>
            </Step>

            <Step n="2" title="Delivery">
              <div className="grid gap-6">
                <div>
                  <label htmlFor="co-country" className={labelCls}>Country</label>
                  <select id="co-country" className={`${field} cursor-pointer appearance-none`} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country">
                    {Object.entries(COUNTRIES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <ShippingOptions cart={cart} country={country} light name="co-shipping" />
                {posting && (
                  <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                    <Field id="co-line1" label="Address line 1" required autoComplete="address-line1" value={form.line1} onChange={update('line1')} className="sm:col-span-2" />
                    <Field id="co-line2" label="Address line 2 (optional)" autoComplete="address-line2" value={form.line2} onChange={update('line2')} className="sm:col-span-2" />
                    <Field id="co-city" label="Town or city" required autoComplete="address-level2" value={form.city} onChange={update('city')} />
                    <Field id="co-postcode" label={country === 'IE' ? 'Eircode' : 'Postcode'} required autoComplete="postal-code" value={form.postcode} onChange={update('postcode')} />
                  </div>
                )}
                <div>
                  <label htmlFor="co-notes" className={labelCls}>Order notes (optional)</label>
                  <textarea id="co-notes" rows={2} className={`${field} resize-y`} value={form.notes} onChange={update('notes')} placeholder="Event date, matching cloth, anything we should know." />
                </div>
              </div>
            </Step>

            <PaymentStep method={payment} onChange={setPayment} />
          </div>

          <aside className="lg:col-span-5" aria-label="Order summary">
            <div className="grid gap-6 bg-charcoal p-6 text-cream md:p-8 lg:sticky lg:top-28">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-[1.8rem] font-semibold leading-none">Your order</h2>
                <Link to="/cart" className="text-[12px] font-bold uppercase tracking-[0.18em] text-gold hover:text-gold-light">Edit</Link>
              </div>
              <ul className="grid gap-4">
                {cart.lines.map((l) => (
                  <li key={l.slug} className="grid grid-cols-[52px_1fr_auto] items-center gap-3">
                    <Photo className="aspect-square w-full" src={img(l.product.imageId, 120, 120)} alt="" />
                    <span className="text-[14px] leading-snug">
                      <span className="block font-semibold">{l.product.name}</span>
                      <span className="text-cream/65">{metresLabel(l.metres)}{l.discount > 0 && `, ${Math.round(l.rate * 100)}% off`}</span>
                    </span>
                    <span className="text-[15px]">{money(l.total)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-dashed border-cream/25 pt-5">
                <Totals cart={cart} shipping={shipping} />
              </div>
              <button
                type="submit"
                disabled={payment !== 'whatsapp'}
                className="btn-gold min-h-[60px] w-full disabled:cursor-not-allowed disabled:bg-cream/20 disabled:text-cream/60 disabled:hover:translate-y-0"
              >
                {payment === 'whatsapp' ? (
                  <>
                    <WhatsAppIcon /> Send order on WhatsApp
                  </>
                ) : (
                  'Card payments coming soon'
                )}
              </button>
              <p className="text-[12px] leading-relaxed text-cream/60">
                Nothing is charged online. Your order opens in WhatsApp to {PHONE_DISPLAY}, ready to send, and we confirm stock and payment with you there.
              </p>
            </div>
          </aside>
        </form>
      </section>
      <WeaveDivider from="#FAF4E4" to="#0A0A0A" />
    </>
  )
}
