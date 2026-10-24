import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { useProducts } from './products'
import { MAX_CART_METRES, MIN_METRES, STEP, priceLine, roundToStep, shippingCost } from './pricing'

const KEY = 'esterica-cart'
const CartContext = createContext(null)

const clampMetres = (m, max = MAX_CART_METRES) => Math.min(max, roundToStep(m))
// The most of one cloth the cart can hold: the online limit, or less when the shelf holds less.
const limitFor = (product) => Math.min(MAX_CART_METRES, Math.floor((product?.stock ?? 0) / STEP) * STEP)

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (!saved || !Array.isArray(saved.items)) return null
    // The catalogue is still loading here, so cloth that has gone is dropped later, by `prune`.
    const items = saved.items.filter((i) => typeof i.slug === 'string' && i.metres >= MIN_METRES).map((i) => ({ slug: i.slug, metres: clampMetres(i.metres) }))
    return { items, shipping: saved.shipping === 'collect' ? 'collect' : 'standard' }
  } catch {
    return null
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((i) => i.slug === action.slug)
      const items = existing
        ? state.items.map((i) => (i.slug === action.slug ? { ...i, metres: clampMetres(i.metres + action.metres, action.max) } : i))
        : [...state.items, { slug: action.slug, metres: clampMetres(action.metres, action.max) }]
      return { ...state, items }
    }
    case 'set':
      return { ...state, items: state.items.map((i) => (i.slug === action.slug ? { ...i, metres: clampMetres(action.metres, action.max) } : i)) }
    // Once the catalogue arrives: drop cloth that is gone or sold out, and trim lengths to what is left.
    case 'prune': {
      const items = state.items
        .map((i) => ({ ...i, metres: Math.min(i.metres, action.limits[i.slug] ?? 0) }))
        .filter((i) => i.metres >= MIN_METRES)
      return items.length === state.items.length && items.every((i, n) => i.metres === state.items[n].metres) ? state : { ...state, items }
    }
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.slug !== action.slug) }
    case 'shipping':
      return { ...state, shipping: action.method }
    case 'clear':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const { bySlug, products, status } = useProducts()
  const [state, dispatch] = useReducer(reducer, null, () => load() ?? { items: [], shipping: 'standard' })
  // The last thing added, for the confirmation toast.
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable: the cart lasts for this visit only */
    }
  }, [state])

  useEffect(() => {
    if (status === 'ready') dispatch({ type: 'prune', limits: Object.fromEntries(products.map((p) => [p.slug, limitFor(p)])) })
  }, [status, products])

  const add = useCallback(
    (slug, metres) => {
      const max = limitFor(bySlug(slug))
      const before = state.items.find((i) => i.slug === slug)?.metres ?? 0
      // Sold out: nothing goes in, and the toast says why.
      const after = max >= MIN_METRES ? clampMetres(before + metres, max) : before
      if (after !== before) dispatch({ type: 'add', slug, metres, max })
      const capped = before + metres > max
      setNotice({ id: Date.now(), slug, added: after - before, total: after, capped, limit: capped && max < MAX_CART_METRES ? 'stock' : 'trade', max })
    },
    [state.items, bySlug],
  )

  const value = useMemo(() => {
    // Until the catalogue loads, `ready` is false and the lines are empty.
    const lines = state.items.flatMap((i) => {
      const product = bySlug(i.slug)
      return product ? [{ ...i, product, max: limitFor(product), ...priceLine(product.perMetre, i.metres) }] : []
    })
    const gross = lines.reduce((s, l) => s + l.gross, 0)
    const discount = lines.reduce((s, l) => s + l.discount, 0)
    const subtotal = gross - discount
    const shipping = shippingCost(state.shipping, subtotal)
    return {
      ready: status === 'ready',
      lines,
      count: lines.length,
      metres: lines.reduce((s, l) => s + l.metres, 0),
      gross,
      discount,
      subtotal,
      method: state.shipping,
      shipping,
      total: subtotal + (shipping ?? 0),
      add,
      setMetres: (slug, metres) => dispatch({ type: 'set', slug, metres, max: limitFor(bySlug(slug)) }),
      remove: (slug) => dispatch({ type: 'remove', slug }),
      setShipping: (method) => dispatch({ type: 'shipping', method }),
      clear: () => dispatch({ type: 'clear' }),
      notice,
      dismissNotice: () => setNotice(null),
    }
  }, [state, add, notice, bySlug, status])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
