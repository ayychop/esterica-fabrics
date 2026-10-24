import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigError } from '../supabaseClient'
import { toProduct } from '../data/products'

const ProductsContext = createContext(null)

// The catalogue and the store's open/closed switch, loaded once from Supabase for the whole site.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [storeOpen, setStoreOpen] = useState(true)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      if (supabaseConfigError) throw new Error(supabaseConfigError)
      const [catalogue, settings] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('is_open').eq('id', 1).maybeSingle(),
      ])
      if (catalogue.error) throw catalogue.error
      setProducts(catalogue.data.map(toProduct))
      // Without a settings row the shop stays open, as it always has been.
      setStoreOpen(settings.data?.is_open ?? true)
      setStatus('ready')
    } catch (e) {
      console.error('Could not load products:', e)
      setError(e.message || String(e))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(() => {
    const index = new Map(products.map((p) => [p.slug, p]))
    return { products, status, error, storeOpen, reload: load, bySlug: (slug) => index.get(slug) }
  }, [products, status, error, storeOpen, load])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export const useProducts = () => useContext(ProductsContext)
