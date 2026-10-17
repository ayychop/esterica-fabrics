import { img } from '../config'
import { TIERS } from '../lib/pricing'

// Sample stock for the demo shop. Swap names, copy and photography for the real bolts before launch.
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

export const PRODUCTS = [
  {
    slug: 'royal-gold',
    tone: 'gold',
    name: 'Royal Gold',
    imageId: '1660695828374-4ff51ac9df5d',
    tier: 'premium',
    weave: 'Sika Futuro',
    origin: 'Hand-woven in Bonwire, Ashanti Region, Ghana',
    occasions: ['Weddings & engagements', 'Festivals & durbars'],
    colours: ['Gold', 'Green'],
    patterns: ['Geometric blocks', 'Warp stripes'],
    added: '2026-09-28',
    blurb: 'A Sika Futuro weave, "gold dust", named for its field of gold. Worn to say the wearer has arrived: bright, heavy and made for the engagement and the durbar.',
  },
  {
    slug: 'adinkra-wine',
    tone: 'crimson',
    name: 'Adinkra Wine',
    imageId: '1578509566163-068acd11b8e7',
    tier: 'budget',
    weave: 'Adinkra print',
    origin: 'Printed in Ghana on cotton',
    occasions: ['Everyday wear', 'Church & Sunday best'],
    colours: ['Red', 'Black'],
    patterns: ['Printed'],
    added: '2026-07-12',
    blurb: 'Adinkra symbols printed on deep red and black cotton, the colours of remembrance. A quiet, dignified cloth for Sunday service and everyday wear, and easy for a new tailor to sew.',
  },
  {
    slug: 'forest-pride',
    tone: 'forest',
    name: 'Forest Pride',
    imageId: '1655682614757-a9a33fa45c93',
    tier: 'standard',
    weave: 'Asante warp stripe',
    origin: 'Hand-woven in Bonwire, Ashanti Region, Ghana',
    occasions: ['Graduations', 'Festivals & durbars'],
    colours: ['Green', 'Gold', 'Black'],
    patterns: ['Warp stripes'],
    added: '2026-08-30',
    blurb: 'Green warp stripes for growth, edged in gold and steadied with black for maturity. A natural cloth for graduation stoles and the family photograph afterwards.',
  },
  {
    slug: 'indigo-crown',
    tone: 'indigo',
    name: 'Indigo Crown',
    imageId: '1734868032501-448d1457dc38',
    tier: 'designer',
    weave: 'Emaa Da',
    origin: 'Hand-woven in Adanwomase, Ashanti Region, Ghana',
    occasions: ['Weddings & engagements', 'Church & Sunday best'],
    colours: ['Indigo', 'Gold'],
    patterns: ['Geometric blocks'],
    added: '2026-10-09',
    blurb: 'An Emaa Da design, "it has not happened before", in indigo and gold. Blue for peace and love, gold for the occasion: a limited weave for the bride, the groom and the top table.',
  },
  {
    slug: 'ashanti-sunrise',
    tone: 'gold',
    name: 'Ashanti Sunrise',
    imageId: '1660695828403-b42e117e0b4f',
    tier: 'standard',
    weave: 'Asante check',
    origin: 'Hand-woven in Adanwomase, Ashanti Region, Ghana',
    occasions: ['Festivals & durbars', 'Naming ceremonies', 'Graduations'],
    colours: ['Gold', 'Red', 'Green'],
    patterns: ['Woven checks'],
    added: '2026-06-18',
    blurb: 'Gold, red and green checks, the colours most people picture when they think of kente. Joyful for naming days, festivals and every celebration in between.',
  },
  {
    slug: 'ewe-heritage',
    tone: 'indigo',
    name: 'Ewe Heritage',
    imageId: '1444362408440-274ecb6fc730',
    tier: 'premium',
    weave: 'Ewe kente',
    origin: 'Hand-woven in Agotime Kpetoe, Volta Region, Ghana',
    occasions: ['Weddings & engagements', 'Church & Sunday best'],
    colours: ['Gold', 'Green', 'Indigo'],
    patterns: ['Ewe motifs'],
    added: '2026-09-05',
    blurb: 'Ewe kente from the Volta Region, where weavers set small figures between the strips, often drawn from proverbs. Finer and softer in the hand, with a story in every panel.',
  },
  {
    slug: 'bonwire-classic',
    tone: 'charcoal',
    name: 'Bonwire Classic',
    imageId: '1552710307-537199cd41c0',
    tier: 'designer',
    weave: 'Adweneasa',
    origin: 'Hand-woven in Bonwire, Ashanti Region, Ghana',
    occasions: ['Graduations', 'Festivals & durbars'],
    colours: ['Gold', 'Red', 'Green'],
    patterns: ['Geometric blocks', 'Woven checks'],
    added: '2026-10-02',
    blurb: 'Adweneasa, "my skill is exhausted": a weave with a motif in every block, the weaver\'s finest work. From the town that made kente famous, with a rich, heavy drape.',
  },
  {
    slug: 'akwaaba-bloom',
    tone: 'forest',
    name: 'Akwaaba Bloom',
    imageId: '1784123476742-de48239d2fb0',
    tier: 'budget',
    weave: 'Kente-style print',
    origin: 'Printed in Ghana on cotton',
    occasions: ['Naming ceremonies', 'Everyday wear', 'Church & Sunday best'],
    colours: ['Gold', 'Green'],
    patterns: ['Printed'],
    added: '2026-10-12',
    blurb: 'Akwaaba means welcome. A bright kente-style print in gold and green, light and cheerful for a new baby\'s naming day, and kind to the budget for big family orders.',
  },
].map((p) => ({ ...p, perMetre: TIERS[p.tier].perMetre, tierLabel: TIERS[p.tier].label }))

export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug)

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

export const viewSrc = (imageId, view, w, h) =>
  view.fp ? `${img(imageId, w, h)}&crop=focalpoint&fp-x=${view.fp[0]}&fp-y=${view.fp[1]}&fp-z=${view.fp[2]}` : img(imageId, w, h)

// Related: shares an occasion or a colour, closest in price first.
export function relatedTo(product, count = 4) {
  return PRODUCTS.filter((p) => p.slug !== product.slug)
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
