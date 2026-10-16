import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { productBySlug } from '../data/products'
import { MAX_CART_METRES, MIN_METRES, priceLine, roundToStep, shippingCost } from './pricing'

const KEY = 'esterica-cart'
const CartContext = createContext(null)

const clampMetres = (m) => Math.min(MAX_CART_METRES, roundToStep(m))

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (!saved || !Array.isArray(saved.items)) return null
    // Drop anything that is no longer stocked.
    const items = saved.items.filter((i) => productBySlug(i.slug) && i.metres >= MIN_METRES).map((i) => ({ slug: i.slug, metres: clampMetres(i.metres) }))
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
        ? state.items.map((i) => (i.slug === action.slug ? { ...i, metres: clampMetres(i.metres + action.metres) } : i))
        : [...state.items, { slug: action.slug, metres: clampMetres(action.metres) }]
      return { ...state, items }
    }
    case 'set':
      return { ...state, items: state.items.map((i) => (i.slug === action.slug ? { ...i, metres: clampMetres(action.metres) } : i)) }
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

  const add = useCallback(
    (slug, metres) => {
      const before = state.items.find((i) => i.slug === slug)?.metres ?? 0
      const after = clampMetres(before + metres)
      dispatch({ type: 'add', slug, metres })
      setNotice({ id: Date.now(), slug, added: after - before, total: after, capped: before + metres > MAX_CART_METRES })
    },
    [state.items],
  )

  const value = useMemo(() => {
    const lines = state.items.map((i) => {
      const product = productBySlug(i.slug)
      return { ...i, product, ...priceLine(product.perMetre, i.metres) }
    })
    const gross = lines.reduce((s, l) => s + l.gross, 0)
    const discount = lines.reduce((s, l) => s + l.discount, 0)
    const subtotal = gross - discount
    const shipping = shippingCost(state.shipping, subtotal)
    return {
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
      setMetres: (slug, metres) => dispatch({ type: 'set', slug, metres }),
      remove: (slug) => dispatch({ type: 'remove', slug }),
      setShipping: (method) => dispatch({ type: 'shipping', method }),
      clear: () => dispatch({ type: 'clear' }),
      notice,
      dismissNotice: () => setNotice(null),
    }
  }, [state, add, notice])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
