import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// A small History API router: real URLs (/shop, /cart) without another dependency.
// The host must serve index.html for unknown paths (Vite does this in dev and preview).
const RouterContext = createContext(null)

const read = (pop = false) => {
  const s = window.history.state || {}
  return {
    path: window.location.pathname.replace(/\/+$/, '') || '/',
    search: window.location.search,
    hash: decodeURIComponent(window.location.hash.slice(1)),
    data: s.data ?? null,
    // where to put the page: the remembered spot when going Back, otherwise the top (or the #hash)
    scroll: pop ? s.scroll ?? 0 : 0,
    pop,
  }
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(() => read())

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const onPop = () => setLocation(read(true))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, { state = null, replace = false } = {}) => {
    const url = new URL(to, window.location.href)
    // Remember the scroll position of the page we are leaving, so Back returns to the same spot.
    window.history.replaceState({ ...window.history.state, scroll: window.scrollY }, '')
    window.history[replace ? 'replaceState' : 'pushState']({ data: state }, '', url.pathname + url.search + url.hash)
    setLocation(read())
  }, [])

  return <RouterContext.Provider value={{ location, navigate }}>{children}</RouterContext.Provider>
}

export const useRouter = () => useContext(RouterContext)

// An ordinary link that changes page without a reload. Modified clicks (new tab etc.) behave as normal.
export function Link({ to, state, onClick, ...rest }) {
  const { navigate } = useRouter()
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to, { state })
      }}
      {...rest}
    />
  )
}

export function matchRoute(path) {
  if (path === '/') return { name: 'home' }
  if (path === '/shop') return { name: 'shop' }
  const product = path.match(/^\/shop\/([a-z0-9-]+)$/)
  if (product) return { name: 'product', slug: product[1] }
  if (path === '/cart') return { name: 'cart' }
  if (path === '/checkout') return { name: 'checkout' }
  if (path === '/order-confirmed') return { name: 'confirmed' }
  if (path === '/success') return { name: 'success' }
  return { name: 'notfound' }
}
