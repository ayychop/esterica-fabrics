// All money is held in pence, so totals never pick up floating point crumbs.

export const TIERS = {
  budget: { label: 'Budget Prints', perMetre: 1200 },
  standard: { label: 'Standard Kente', perMetre: 2800 },
  premium: { label: 'Premium Kente', perMetre: 5500 },
  designer: { label: 'Designer', perMetre: 9500 },
}

// Bulk discounts apply automatically to each fabric's metres. Largest first.
export const BULK = [
  { min: 10, rate: 0.15 },
  { min: 5, rate: 0.1 },
]

// 20 metres or more of one cloth is a trade order, priced on WhatsApp.
export const TRADE_MIN = 20
export const STEP = 0.5
export const MIN_METRES = 0.5
export const MAX_CART_METRES = TRADE_MIN - STEP

export const FREE_SHIPPING_FROM = 7500

export const SHIPPING = {
  standard: { label: 'Standard UK post', short: 'UK post', price: 495, eta: '2 to 3 business days' },
  collect: { label: 'Click & Collect, Wembley', short: 'Click & Collect', price: 0, eta: 'Ready to collect during opening hours' },
}

export const COUNTRIES = { GB: 'United Kingdom', IE: 'Ireland' }

export const bulkRate = (metres) => BULK.find((b) => metres >= b.min)?.rate ?? 0

export function priceLine(perMetre, metres) {
  const gross = Math.round(perMetre * metres)
  const rate = bulkRate(metres)
  const discount = Math.round(gross * rate)
  return { gross, rate, discount, total: gross - discount }
}

// null means the cost is not fixed: Irish postage is quoted with the order.
export function shippingCost(method, subtotal, country = 'GB') {
  if (method === 'collect') return 0
  if (country !== 'GB') return null
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING.standard.price
}

// The next discount band above the current metres, for a gentle nudge.
export function nextBand(metres) {
  const bands = [...BULK].reverse()
  return bands.find((b) => metres < b.min) ?? null
}

export const roundToStep = (m) => Math.max(MIN_METRES, Math.round(m / STEP) * STEP)

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
export const money = (pence) => gbp.format(pence / 100)
// Whole pounds read cleaner on a price tag: £28, not £28.00.
export const perMetreLabel = (pence) => (pence % 100 ? money(pence) : `£${pence / 100}`)
export const metresLabel = (m) => `${m % 1 ? m.toFixed(1) : m}m`
export const percent = (rate) => `${Math.round(rate * 100)}%`

// UK delivery estimate: 2 to 3 business days from today, London time.
export function deliveryWindow(from = new Date()) {
  const addBusinessDays = (date, n) => {
    const d = new Date(date)
    while (n > 0) {
      d.setDate(d.getDate() + 1)
      if (d.getDay() !== 0 && d.getDay() !== 6) n--
    }
    return d
  }
  const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' })
  return `${fmt(addBusinessDays(from, 2))} to ${fmt(addBusinessDays(from, 3))}`
}
