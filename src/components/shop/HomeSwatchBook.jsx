import SwatchBook from './SwatchBook'
import { PRODUCTS } from '../../data/products'
import { useRouter } from '../../lib/router'

const NEWEST = [...PRODUCTS].sort((a, b) => b.added.localeCompare(a.added))

// The homepage's collection: the same swatch book as the shop, newest cloth first.
// "Browse all" opens the shop at its full grid.
export default function HomeSwatchBook() {
  const { navigate } = useRouter()
  return <SwatchBook id="collection" products={NEWEST} browse={() => navigate('/shop#browse')} />
}
