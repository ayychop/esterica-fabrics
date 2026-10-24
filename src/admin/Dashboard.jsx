import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from '../components/Logo'
import { KenteStrip } from '../components/Kente'
import { TierBadge } from '../components/shop/ProductCard'
import { CheckIcon } from '../components/ui'
import { supabase } from '../supabaseClient'
import { productImg, toProduct } from '../data/products'
import { metresLabel, perMetreLabel } from '../lib/pricing'
import AddProductForm from './AddProductForm'

const EASE = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring', stiffness: 520, damping: 34 }

function Alert({ children }) {
  return <p role="alert" className="border-l-2 border-crimson bg-crimson/20 px-4 py-3 text-[13px] leading-snug text-cream">{children}</p>
}

// The store's open/closed switch: store_settings, row 1. Closed pauses card checkout on the site.
function StoreStatus() {
  const [open, setOpen] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('store_settings')
      .select('is_open')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return setError(error.message)
        if (!data) return setError('The store_settings table has no row with id 1. Run the admin portal migration.')
        setOpen(data.is_open)
      })
  }, [])

  const toggle = async () => {
    const next = !open
    setOpen(next)
    setSaving(true)
    setError(null)
    // .single() turns an update that Row Level Security quietly refused (no rows) into an error.
    const { error } = await supabase.from('store_settings').update({ is_open: next, updated_at: new Date().toISOString() }).eq('id', 1).select('is_open').single()
    setSaving(false)
    if (error) {
      setOpen(!next)
      setError(`Could not change the store status: ${error.message}`)
    }
  }

  const known = open !== null
  return (
    <section aria-labelledby="store-status" className={`grid gap-6 p-6 transition-colors duration-500 md:p-8 ${!known ? 'bg-charcoal' : open ? 'bg-forest' : 'bg-crimson'}`}>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 id="store-status" className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cream/80">Store status</h2>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={known ? String(open) : 'loading'}
              className="mt-2 font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-none"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {!known ? 'Loading' : open ? 'Open' : 'Closed'}
            </motion.p>
          </AnimatePresence>
          <p className="mt-3 max-w-md text-[14px] leading-snug text-cream/85">
            {!known ? 'Reading the current setting.' : open ? 'Customers can pay by card at checkout.' : 'Card checkout is paused. Customers can still order on WhatsApp.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(open)}
          aria-labelledby="store-status"
          disabled={!known || saving}
          onClick={toggle}
          className={`relative flex h-[52px] w-[96px] shrink-0 items-center rounded-full border-2 border-cream p-1 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-wait ${
            open ? 'justify-end bg-ink' : 'justify-start bg-ink/40'
          }`}
        >
          <motion.span layout transition={SPRING} className={`block h-10 w-10 rounded-full ${open ? 'bg-gold' : 'bg-cream'}`} />
        </button>
      </div>
      {error && <Alert>{error}</Alert>}
    </section>
  )
}

// Type a new length and save it. Enter saves too.
function StockEditor({ product, onSaved }) {
  const [value, setValue] = useState(String(product.stock))
  const [state, setState] = useState('idle')
  const [error, setError] = useState(null)
  useEffect(() => setValue(String(product.stock)), [product.stock])

  const n = Number(value)
  const valid = value.trim() !== '' && Number.isFinite(n) && n >= 0 && n < 100000
  const changed = valid && n !== product.stock

  const save = async () => {
    if (!changed) return
    setState('saving')
    setError(null)
    const stock = Math.round(n * 10) / 10
    const { data, error } = await supabase.from('products').update({ stock }).eq('id', product.id).select().single()
    if (error) {
      setState('idle')
      return setError(error.message)
    }
    onSaved(toProduct(data))
    setState('saved')
    setTimeout(() => setState('idle'), 1600)
  }

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`stock-${product.id}`}>Stock of {product.name}, in metres</label>
        <div className={`flex h-11 items-center border ${valid ? 'border-cream/30 focus-within:border-gold' : 'border-crimson'}`}>
          <input
            id={`stock-${product.id}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="no-spin h-full w-20 bg-transparent px-3 text-right text-[16px] font-semibold text-cream focus:outline-none"
          />
          <span aria-hidden="true" className="pr-3 text-[14px] text-cream/50">m</span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!changed || state === 'saving'}
          className="relative grid h-11 min-w-[76px] place-items-center bg-gold px-4 text-[12px] font-bold uppercase tracking-[0.16em] text-ink transition-[background-color,opacity] hover:bg-gold-light disabled:bg-cream/10 disabled:text-cream/40"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className={`flex items-center gap-1.5 ${state === 'saved' ? 'text-forest' : ''}`}
            >
              {state === 'saved' ? <><CheckIcon /> Saved</> : state === 'saving' ? 'Saving' : 'Save'}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {error && <p role="alert" className="max-w-[260px] text-right text-[12px] text-crimson">{error}</p>}
    </div>
  )
}

function StockFlag({ stock }) {
  if (stock < 0.5) return <span className="bg-crimson px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cream">Sold out</span>
  if (stock < 10) return <span className="bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink">Low</span>
  return null
}

function Inventory({ products, status, error, onSaved }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = useMemo(
    () => (q ? products.filter((p) => [p.name, p.slug, p.tierLabel].some((v) => v.toLowerCase().includes(q))) : products),
    [products, q],
  )

  return (
    <section aria-labelledby="inventory-title" className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="inventory-title" className="font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold leading-none">Inventory</h2>
        <label className="group relative w-full sm:w-[320px]">
          <span className="sr-only">Search products</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/50 group-focus-within:text-gold" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, slug or category"
            className="field border-cream/30 !py-2.5 pl-7 !text-[15px] text-cream placeholder:text-cream/35"
          />
        </label>
      </div>

      {status === 'error' && <Alert>Could not load products: {error}</Alert>}
      {status === 'loading' && <p className="py-10 text-[12px] font-semibold uppercase tracking-[0.3em] text-gold">Loading products</p>}
      {status === 'ready' && (
        <>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-cream/55" aria-live="polite">
            {q ? `${shown.length} of ${products.length} products` : `${products.length} products`}
          </p>
          {shown.length === 0 ? (
            <p className="border border-dashed border-cream/20 px-6 py-12 text-center text-[15px] text-cream/70">
              {products.length ? `Nothing matches "${query}".` : 'No products yet. Add the first one.'}
            </p>
          ) : (
            <motion.ul layout className="grid border-t border-cream/15">
              <AnimatePresence initial={false}>
                {shown.map((p) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-4 border-b border-cream/15 py-4 sm:grid-cols-[64px_1fr_auto_auto] sm:gap-x-6"
                  >
                    <div className="aspect-[4/5] w-full overflow-hidden bg-charcoal">
                      {p.image && <img src={productImg(p.image, 128, 160)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <a href={`/shop/${p.slug}`} target="_blank" rel="noopener noreferrer" className="block truncate font-serif text-[1.25rem] font-semibold leading-tight transition-colors hover:text-gold">
                        {p.name}
                      </a>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <TierBadge product={p} />
                        <StockFlag stock={p.stock} />
                        <span className="text-[12px] text-cream/45">/{p.slug}</span>
                      </div>
                    </div>
                    <p className="text-[15px] max-sm:col-start-2 sm:text-right">
                      <span className="font-serif text-[1.25rem] font-semibold text-gold">{perMetreLabel(p.perMetre)}</span>
                      <span className="text-cream/55"> per metre</span>
                      <span className="block text-[12px] text-cream/45">{metresLabel(p.stock)} in stock</span>
                    </p>
                    <div className="max-sm:col-span-2">
                      <StockEditor product={p} onSaved={onSaved} />
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </>
      )}
    </section>
  )
}

export default function Dashboard({ user }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
          return setStatus('error')
        }
        setProducts(data.map(toProduct))
        setStatus('ready')
      })
  }, [])

  const replace = (next) => setProducts((list) => list.map((p) => (p.id === next.id ? next : p)))
  const soldOut = products.filter((p) => p.stock < 0.5).length
  const low = products.filter((p) => p.stock >= 0.5 && p.stock < 10).length

  return (
    <div className="min-h-screen bg-ink text-cream">
      <KenteStrip height={10} />
      <header className="border-b border-cream/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Logo className="h-7 w-auto" />
            <span className="bg-gold px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.24em] text-ink">Admin</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold uppercase tracking-[0.18em]">
            <span className="normal-case tracking-normal text-cream/55">{user?.email}</span>
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-cream/75 transition-colors hover:text-gold">View shop</a>
            <button type="button" onClick={() => supabase.auth.signOut()} className="text-gold transition-colors hover:text-gold-light">Sign out</button>
          </div>
        </div>
      </header>

      <motion.main
        className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-24 pt-10 sm:px-8 md:gap-16 md:pt-14"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Esterica Fabrics</p>
            <h1 className="mt-3 font-serif text-[clamp(2.8rem,7vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.02em]">The shop floor</h1>
          </div>
          <button type="button" onClick={() => setAdding(true)} className="btn-gold min-h-[56px]">
            <span aria-hidden="true" className="text-[20px] leading-none">+</span> Add product
          </button>
        </div>

        <div className="grid gap-px bg-cream/10 lg:grid-cols-[1.4fr_1fr]">
          <StoreStatus />
          <dl className="grid grid-cols-3 gap-px bg-cream/10 lg:grid-cols-1">
            {[
              ['Products', products.length],
              ['Low stock', low],
              ['Sold out', soldOut],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col justify-center bg-charcoal px-5 py-5 md:px-8">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cream/55">{k}</dt>
                <dd className="mt-1 font-serif text-[2rem] font-semibold leading-none">{status === 'ready' ? v : '...'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Inventory products={products} status={status} error={error} onSaved={replace} />
      </motion.main>

      <AddProductForm
        open={adding}
        onClose={() => setAdding(false)}
        taken={products.map((p) => p.slug)}
        onAdded={(p) => {
          setProducts((list) => [p, ...list])
          setAdding(false)
        }}
      />
    </div>
  )
}
