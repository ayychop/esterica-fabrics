import { img } from '../config'
import { TIERS } from '../lib/pricing'

// Sample stock for the demo shop. Swap names, copy and photography for the real bolts before launch.
export const OCCASIONS = {
  wedding: 'Weddings & engagements',
  graduation: 'Graduation',
  festival: 'Festivals & durbars',
  church: 'Church & Sunday best',
  naming: 'Naming ceremonies',
  everyday: 'Everyday wear',
}

export const COLOURS = {
  gold: { label: 'Gold', hex: '#E8B31A' },
  red: { label: 'Red', hex: '#C41E1E' },
  green: { label: 'Green', hex: '#0F7A34' },
  indigo: { label: 'Indigo', hex: '#1A4DA0' },
  black: { label: 'Black', hex: '#0A0A0A' },
}

export const PATTERNS = {
  stripes: 'Warp stripes',
  geometric: 'Geometric blocks',
  checks: 'Woven checks',
  motifs: 'Ewe motifs',
  print: 'Printed',
}

export const PRODUCTS = [
  {
    slug: 'royal-gold',
    name: 'Royal Gold',
    imageId: '1660695828374-4ff51ac9df5d',
    tier: 'premium',
    origin: 'Hand-woven in Bonwire, Ashanti Region, Ghana',
    occasions: ['wedding', 'festival'],
    colours: ['gold', 'black'],
    pattern: 'geometric',
    added: '2026-09-28',
    blurb: 'Gold weft on a black ground, the cloth of engagements and durbars. Heavy, bright and made to be seen across a room.',
  },
  {
    slug: 'adinkra-wine',
    name: 'Adinkra Wine',
    imageId: '1578509566163-068acd11b8e7',
    tier: 'budget',
    origin: 'Printed in Ghana on cotton',
    occasions: ['everyday', 'church'],
    colours: ['red', 'black'],
    pattern: 'print',
    added: '2026-07-12',
    blurb: 'Adinkra symbols printed on a deep red cotton. Easy to sew and easy to wear, a good first cloth for a new tailor.',
  },
  {
    slug: 'forest-pride',
    name: 'Forest Pride',
    imageId: '1655682614757-a9a33fa45c93',
    tier: 'standard',
    origin: 'Hand-woven in Bonwire, Ashanti Region, Ghana',
    occasions: ['graduation', 'festival'],
    colours: ['green', 'gold'],
    pattern: 'stripes',
    added: '2026-08-30',
    blurb: 'Bold green warp stripes broken by gold. A favourite for graduation stoles and matching family outfits.',
  },
  {
    slug: 'indigo-crown',
    name: 'Indigo Crown',
    imageId: '1734868032501-448d1457dc38',
    tier: 'designer',
    origin: 'Hand-woven in Adanwomase, Ashanti Region, Ghana',
    occasions: ['wedding'],
    colours: ['indigo', 'gold'],
    pattern: 'geometric',
    added: '2026-10-09',
    blurb: 'Deep indigo blocks crowned with gold. A limited weave for the bride, the groom and the top table.',
  },
  {
    slug: 'ashanti-sunrise',
    name: 'Ashanti Sunrise',
    imageId: '1660695828403-b42e117e0b4f',
    tier: 'standard',
    origin: 'Hand-woven in Adanwomase, Ashanti Region, Ghana',
    occasions: ['festival', 'naming'],
    colours: ['gold', 'red', 'green'],
    pattern: 'checks',
    added: '2026-06-18',
    blurb: 'Gold, red and green checks, warm as first light. Joyful for naming days, festivals and every celebration in between.',
  },
  {
    slug: 'ewe-heritage',
    name: 'Ewe Heritage',
    imageId: '1444362408440-274ecb6fc730',
    tier: 'premium',
    origin: 'Hand-woven in Kpetoe, Volta Region, Ghana',
    occasions: ['church', 'wedding'],
    colours: ['red', 'gold', 'green'],
    pattern: 'motifs',
    added: '2026-09-05',
    blurb: 'Ewe kente with small woven motifs set between the strips. Finer and softer in the hand, with a story in every panel.',
  },
  {
    slug: 'bonwire-classic',
    name: 'Bonwire Classic',
    imageId: '1552710307-537199cd41c0',
    tier: 'designer',
    origin: 'Hand-woven in Bonwire, Ashanti Region, Ghana',
    occasions: ['wedding', 'graduation'],
    colours: ['gold', 'green', 'red'],
    pattern: 'checks',
    added: '2026-10-02',
    blurb: 'The classic Asante cloth from the town that made kente famous. Tight, even weaving with a rich, heavy drape.',
  },
  {
    slug: 'akwaaba-bloom',
    name: 'Akwaaba Bloom',
    imageId: '1784123476742-de48239d2fb0',
    tier: 'budget',
    origin: 'Printed in Ghana on cotton',
    occasions: ['everyday', 'naming'],
    colours: ['gold', 'red'],
    pattern: 'print',
    added: '2026-10-12',
    blurb: 'A bright kente-style print in gold and red. Light, cheerful and kind to the budget for big family orders.',
  },
].map((p) => ({ ...p, perMetre: TIERS[p.tier].perMetre, tierLabel: TIERS[p.tier].label }))

export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug)

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
