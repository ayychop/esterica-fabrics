import { COUNTRIES, SHIPPING, metresLabel, money, percent, perMetreLabel } from './pricing'

// A short reference the shop can quote back, e.g. EF-1016-4821.
export function orderRef(date = new Date()) {
  const md = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `EF-${md}-${Math.floor(1000 + Math.random() * 9000)}`
}

function itemLines(lines) {
  return lines.map((l, i) => {
    const parts = [`${i + 1}. ${l.product.name} (${l.product.tierLabel}), ${metresLabel(l.metres)} at ${perMetreLabel(l.product.perMetre)}/m`]
    if (l.discount) parts.push(`${percent(l.rate)} bulk discount`)
    return `${parts.join(', ')}: ${money(l.total)}`
  })
}

const shippingLine = (cart, country) => {
  if (cart.method === 'collect') return `Delivery: ${SHIPPING.collect.label} (free)`
  if (cart.shipping === null) return `Delivery: Post to ${COUNTRIES[country]} (please quote postage)`
  return `Delivery: ${SHIPPING.standard.label} ${cart.shipping ? money(cart.shipping) : '(free over £75)'}`
}

// The message that lands in the shop's WhatsApp. Plain text, one fact per line.
export function orderMessage(cart, { ref, customer, country = 'GB' } = {}) {
  const out = ["Hi Esterica Fabrics, I'd like to place an order from your website.", '']
  if (ref) out.push(`Order ref: ${ref}`, '')
  out.push(...itemLines(cart.lines), '')
  if (cart.discount) out.push(`Bulk savings: -${money(cart.discount)}`)
  out.push(`Subtotal: ${money(cart.subtotal)}`, shippingLine(cart, country))
  out.push(`Total: ${money(cart.total)}${cart.shipping === null ? ' plus postage' : ''}`)
  if (customer) {
    out.push('', `Name: ${customer.name}`, `Email: ${customer.email}`, `Phone: ${customer.phone}`)
    if (cart.method === 'standard') {
      const address = [customer.line1, customer.line2, customer.city, customer.postcode, COUNTRIES[country]].filter(Boolean).join(', ')
      out.push(`Address: ${address}`)
    }
    if (customer.notes) out.push(`Notes: ${customer.notes}`)
    out.push('', 'Payment: via WhatsApp. Please send me the payment details.')
  }
  return out.join('\n')
}
