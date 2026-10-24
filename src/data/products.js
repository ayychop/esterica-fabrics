import { TIERS } from '../lib/pricing.js'

// The cloth itself lives in the Supabase `products` table, managed from the admin portal. This file holds
// the vocabulary around it.
//
// Every tag below is the exact label shown in the shop filters, so a product's tags and the filter UI
// can never drift apart. Combinations follow Ghanaian custom: red with black is a mourning pairing
// (red is widely read as sorrow and loss, black as maturity and the ancestors), so no red-and-black
// cloth is tagged for weddings, engagements or naming ceremonies. Gold reads as royalty and wealth,
// green as growth and harvest, blue as peace and love.

export const OCCASIONS = [
  'Weddings & engagements',
  'Graduations',
  'Festivals & durbars',
  'Church & Sunday best',
  'Naming ceremonies',
  'Everyday wear',
]

export const COLOURS = ['Gold', 'Red', 'Green', 'Indigo', 'Black']

// Swatch colours for the filter chips, in the site's Kente palette.
export const COLOUR_HEX = { Gold: '#E8B31A', Red: '#C41E1E', Green: '#0F7A34', Indigo: '#1A4DA0', Black: '#0A0A0A' }

export const PATTERNS = ['Warp stripes', 'Geometric blocks', 'Woven checks', 'Ewe motifs', 'Printed']

// The colour block the swatch book shifts to for each cloth: one solid Kente colour, chosen from the
// cloth's own colours, with text and buttons that stay readable on it. The price takes the accent only
// where the accent clears 3:1 against the block (gold on crimson or green does not, so those keep cream).
export const TONES = {
  gold: { bg: '#E8B31A', fg: '#0A0A0A', accent: '#0A0A0A', button: 'bg-ink text-gold hover:bg-charcoal', outline: 'border-ink/60 text-ink hover:bg-ink hover:text-gold' },
  crimson: { bg: '#C41E1E', fg: '#FAF4E4', accent: '#FAF4E4', button: 'bg-gold text-ink hover:bg-gold-light', outline: 'border-cream/60 text-cream hover:bg-cream hover:text-ink' },
  forest: { bg: '#0F7A34', fg: '#FAF4E4', accent: '#FAF4E4', button: 'bg-gold text-ink hover:bg-gold-light', outline: 'border-cream/60 text-cream hover:bg-cream hover:text-ink' },
  indigo: { bg: '#1A4DA0', fg: '#FAF4E4', accent: '#E8B31A', button: 'bg-gold text-ink hover:bg-gold-light', outline: 'border-cream/60 text-cream hover:bg-cream hover:text-ink' },
  charcoal: { bg: '#121212', fg: '#FAF4E4', accent: '#E8B31A', button: 'bg-gold text-ink hover:bg-gold-light', outline: 'border-cream/60 text-cream hover:bg-cream hover:text-ink' },
}

// Each category's default colour block, for cloth added in the admin portal without one.
export const CATEGORY_TONE = { budget: 'forest', standard: 'indigo', premium: 'crimson', designer: 'gold' }

// A row of the Supabase `products` table, in the shape the shop components use.
export function toProduct(row) {
  const tierLabel = TIERS[row.category]?.label ?? row.category
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    perMetre: row.price,
    tier: row.category,
    tierLabel,
    stock: Number(row.stock),
    image: row.image_url ?? '',
    tone: row.tone || CATEGORY_TONE[row.category] || 'charcoal',
    weave: row.weave || tierLabel,
    origin: row.origin ?? '',
    occasions: row.occasions ?? [],
    colours: row.colours ?? [],
    patterns: row.patterns ?? [],
    blurb: row.blurb ?? '',
    added: row.created_at,
  }
}

// Unsplash photographs are sized and cropped through the URL; uploaded photographs are served as they are.
const UNSPLASH = 'https://images.unsplash.com/'
export const canResize = (url) => url?.startsWith(UNSPLASH)
export const productImg = (url, w = 800, h) => (canResize(url) ? `${url}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70` : url)
// widths: the srcset candidates; ratio: height over width, or none to keep the photograph's own shape.
export const productSrcSet = (url, widths, ratio) =>
  canResize(url) ? widths.map((w) => `${productImg(url, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ') : undefined


// Filters: OR inside a category (Gold or Red), AND across categories (Weddings and Gold).
// An empty category places no limit.
export const EMPTY_FILTERS = { occasions: [], colours: [], patterns: [] }
export const matchesFilters = (p, f) =>
  Object.entries(f).every(([key, picked]) => picked.length === 0 || picked.some((tag) => p[key].includes(tag)))

// Several looks at one cloth, cropped from the same photograph until real angles are shot.
export const VIEWS = [
  { label: 'Full cloth' },
  { label: 'Weave close-up', fp: [0.5, 0.5, 2.6] },
  { label: 'Border detail', fp: [0.2, 0.25, 1.9] },
  { label: 'Motif detail', fp: [0.78, 0.7, 2.2] },
  { label: 'Drape', fp: [0.4, 0.85, 1.45] },
]

export const viewSrc = (url, view, w, h) =>
  view.fp && canResize(url) ? `${productImg(url, w, h)}&crop=focalpoint&fp-x=${view.fp[0]}&fp-y=${view.fp[1]}&fp-z=${view.fp[2]}` : productImg(url, w, h)

// Related: shares an occasion or a colour, closest in price first.
export function relatedTo(product, products, count = 4) {
  return products.filter((p) => p.slug !== product.slug)
    .map((p) => ({
      p,
      score:
        p.occasions.filter((o) => product.occasions.includes(o)).length * 2 +
        p.colours.filter((c) => product.colours.includes(c)).length +
        (p.tier === product.tier ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || Math.abs(a.p.perMetre - product.perMetre) - Math.abs(b.p.perMetre - product.perMetre))
    .slice(0, count)
    .map((x) => x.p)
}
