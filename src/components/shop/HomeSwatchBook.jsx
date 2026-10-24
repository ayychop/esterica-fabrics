import SwatchBook from './SwatchBook'
import { useProducts } from '../../lib/products'
import { useRouter } from '../../lib/router'

// The homepage's collection: the same swatch book as the shop, newest cloth first.
// "Browse all" opens the shop at its full grid. Until the catalogue arrives, its place is held.
export default function HomeSwatchBook() {
  const { navigate } = useRouter()
  const { products, status } = useProducts()
  if (status !== 'ready') return <section id="collection" aria-label="Swatch book" aria-busy="true" className="min-h-[70svh] bg-charcoal" />
  const newest = [...products].sort((a, b) => b.added.localeCompare(a.added))
  return <SwatchBook id="collection" products={newest} browse={() => navigate('/shop#browse')} />
}
