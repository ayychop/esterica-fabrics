import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import PageTitle from '../components/shop/PageTitle'
import WeaveDivider from '../components/WeaveDivider'
import { ShippingOptions, Totals } from './CartPage'
import { ArrowIcon, BagIcon, WhatsAppIcon } from '../components/ui'
import { Link, useRouter } from '../lib/router'
import { useSmoothScroll } from '../lib/scroll'
import { useCart } from '../lib/cart'
import { orderMessage, orderRef } from '../lib/order'
import { COUNTRIES, metresLabel, money, shippingCost } from '../lib/pricing'
import { PHONE_DISPLAY, img, whatsappLink } from '../config'
import { supabase } from '../supabaseClient'

export const CONFIRM_KEY = 'esterica-last-order'

const EASE = [0.22, 1, 0.36, 1]
const field = 'field border-charcoal/35 text-charcoal placeholder:text-charcoal/35'
// The label warms to gold with its field, so focus reads from the top of the field to its stitched line.
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-charcoal/70 transition-colors duration-300 group-focus-within:text-gold-dark'

function Field({ id, label, className = '', ...props }) {
  return (
    <div className={`group ${className}`}>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} className={field} {...props} />
    </div>
  )
}

function Step({ n, title, delay = 0, id, children }) {
  return (
    <motion.fieldset
      id={id}
      className="border-t border-charcoal/15 pt-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      <legend className="float-left mb-8 flex w-full items-baseline gap-4">
        <span className="font-serif text-[1.1rem] font-semibold text-crimson">0{n}</span>
        <span className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-semibold leading-none">{title}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </motion.fieldset>
  )
}

// Card is the main way to pay; WhatsApp stays as the second route and submits the form.
function PaymentStep({ onCard, paying }) {
  return (
    <Step n="3" title="Payment" delay={0.36} id="co-payment">
      <div className="grid gap-3">
        <button
          type="button"
          onClick={onCard}
          disabled={paying}
          className="group flex w-full items-start gap-4 border-2 border-gold bg-gold/15 p-5 text-left transition-colors duration-300 hover:bg-gold/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70 md:p-6"
        >
          <span className="flex-1">
            <span className="flex flex-wrap items-center gap-2.5 text-[16px] font-semibold">
              Pay with Card
              <span className="rounded-[2px] bg-charcoal px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-cream">Secure</span>
            </span>
            <span className="mt-1.5 block text-[13px] leading-snug text-charcoal/70">Visa, Mastercard and Apple Pay, through Stripe. Your order is confirmed as soon as you pay.</span>
          </span>
          <ArrowIcon className="mt-1 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <button
          type="submit"
          className="flex w-full items-start gap-3 border border-charcoal/20 p-4 text-left transition-colors duration-300 hover:border-charcoal/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <WhatsAppIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-forest" />
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Order via WhatsApp instead</span>
            <span className="mt-1 block text-[13px] leading-snug text-charcoal/65">Your order opens in WhatsApp, ready to send. We reply with payment details.</span>
          </span>
        </button>
      </div>
    </Step>
  )
}

export default function CheckoutPage() {
  const cart = useCart()
  const { navigate } = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', postcode: '', notes: '' })
  const [country, setCountry] = useState('GB')
  const [paying, setPaying] = useState(false)
  const formRef = useRef(null)
  const { scrollTo } = useSmoothScroll()
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    document.title = 'Checkout | Esterica Fabrics'
  }, [])

  const shipping = shippingCost(cart.method, cart.subtotal, country)
  const posting = cart.method === 'standard'

  // Card payments go through Stripe Checkout via the create-checkout-session Supabase function.
  const handleStripeCheckout = async () => {
    setPaying(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        // Only slugs and metres leave the browser: the function prices everything from the product data.
        body: { items: cart.items.map(({ slug, metres }) => ({ slug, metres })), method: cart.method, country },
      })
      if (error) throw error
      window.location.href = data.url
    } catch (error) {
      console.error('Payment error:', error)
      // A refused request carries the function's own reason, such as postage to Ireland being quoted.
      const reason = await error.context?.json?.().then((body) => body.error, () => null)
      alert(reason || 'Could not start card checkout. Please try again, or order on WhatsApp.')
      setPaying(false)
    }
  }

  // Card payment waits for a complete form: otherwise glide to the first empty required field and focus it.
  const payByCard = () => {
    const missing = Array.from(formRef.current?.elements ?? []).find((el) => el.tagName !== 'FIELDSET' && !el.checkValidity())
    if (!missing) return handleStripeCheckout()
    scrollTo(missing)
    missing.focus({ preventScroll: true })
  }

  const submit = (e) => {
    e.preventDefault()
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
        <section className="bg-cream pb-24 md:pb-36">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <PageTitle title="Checkout" crumbs={[{ label: 'The Collection', to: '/shop' }, { label: 'Checkout' }]} />
            <div className="border-t border-charcoal/15 py-16 md:py-24">
              <BagIcon className="h-10 w-10 text-charcoal/50" />
              <p className="accent mt-5 text-[clamp(1.6rem,3vw,2.2rem)] text-charcoal/80">Your cart is empty, so there is nothing to check out yet.</p>
              <Link to="/shop" className="btn-gold mt-8">
                Browse the collection <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
        <WeaveDivider from="#FAF4E4" to="#0A0A0A" />
      </>
    )
  }

  return (
    <>
      <section className="bg-cream pb-24 md:pb-36">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <PageTitle
            title="Checkout"
            line="Pay securely by card, or order on WhatsApp"
            crumbs={[{ label: 'The Collection', to: '/shop' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
          />

          <form ref={formRef} onSubmit={submit} className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="grid gap-14 lg:col-span-7">
              <Step n="1" title="Your details" delay={0.2}>
                <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  <Field id="co-name" label="Full name" required autoComplete="name" value={form.name} onChange={update('name')} className="sm:col-span-2" />
                  <Field id="co-email" label="Email" type="email" required autoComplete="email" value={form.email} onChange={update('email')} />
                  <Field id="co-phone" label="Phone" type="tel" required autoComplete="tel" value={form.phone} onChange={update('phone')} />
                </div>
              </Step>

              <Step n="2" title="Delivery" delay={0.28}>
                <div className="grid gap-8">
                  <div className="group">
                    <label htmlFor="co-country" className={labelCls}>Country</label>
                    <select id="co-country" className={`${field} cursor-pointer appearance-none`} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country">
                      {Object.entries(COUNTRIES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <ShippingOptions cart={cart} country={country} name="co-shipping" />
                  {posting && (
                    <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                      <Field id="co-line1" label="Address line 1" required autoComplete="address-line1" value={form.line1} onChange={update('line1')} className="sm:col-span-2" />
                      <Field id="co-line2" label="Address line 2 (optional)" autoComplete="address-line2" value={form.line2} onChange={update('line2')} className="sm:col-span-2" />
                      <Field id="co-city" label="Town or city" required autoComplete="address-level2" value={form.city} onChange={update('city')} />
                      <Field id="co-postcode" label={country === 'IE' ? 'Eircode' : 'Postcode'} required autoComplete="postal-code" value={form.postcode} onChange={update('postcode')} />
                    </div>
                  )}
                  <div className="group">
                    <label htmlFor="co-notes" className={labelCls}>Order notes (optional)</label>
                    <textarea id="co-notes" rows={2} className={`${field} resize-y`} value={form.notes} onChange={update('notes')} placeholder="Event date, matching cloth, anything we should know." />
                  </div>
                </div>
              </Step>

              <PaymentStep onCard={payByCard} paying={paying} />
            </div>

            <motion.aside
              className="lg:col-span-5"
              aria-label="Order summary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            >
              <div className="grid gap-7 bg-charcoal p-6 text-cream sm:p-8 md:p-10 lg:sticky lg:top-28">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-[2rem] font-semibold leading-none">Your order</h2>
                  <Link to="/cart" className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold hover:text-gold-light">Edit</Link>
                </div>
                <ul className="grid gap-4">
                  {cart.lines.map((l) => (
                    <li key={l.slug} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
                      <div className="photo aspect-[4/5] w-full">
                        <img src={img(l.product.imageId, 128, 160)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[14px] leading-snug">
                        <span className="block font-serif text-[1.15rem] font-semibold">{l.product.name}</span>
                        <span className="text-cream/65">{metresLabel(l.metres)}{l.discount > 0 && `, ${Math.round(l.rate * 100)}% off`}</span>
                      </span>
                      <span className="text-[15px]">{money(l.total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-cream/15 pt-6">
                  <Totals cart={cart} shipping={shipping} />
                </div>
                <div className="grid gap-3">
                  <button type="button" onClick={payByCard} disabled={paying} className="btn-gold min-h-[64px] w-full text-[15px] disabled:cursor-wait disabled:opacity-70">
                    {paying ? 'Opening secure checkout' : 'Pay securely with Card'} {!paying && <ArrowIcon />}
                  </button>
                  <button type="submit" className="btn min-h-[52px] w-full border border-gold/60 text-[13px] text-gold hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10">
                    <WhatsAppIcon /> Order via WhatsApp
                  </button>
                </div>
                <p className="text-[12px] leading-relaxed text-cream/60">
                  Card payments are handled securely by Stripe. Prefer WhatsApp? Your order opens to {PHONE_DISPLAY}, ready to send, and we confirm stock and payment with you there.
                </p>
              </div>
            </motion.aside>
          </form>
        </div>
      </section>
      <WeaveDivider from="#FAF4E4" to="#0A0A0A" />
    </>
  )
}
