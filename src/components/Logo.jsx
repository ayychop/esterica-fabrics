import { E_MARK, WORDMARK } from './logoPaths'

const GOLD = '#E8B31A'

// The calligraphic E alone: favicon, small marks.
export function LogoMark({ className = '', title = 'Esterica' }) {
  return (
    <svg className={className} viewBox={`0 0 ${E_MARK.w} ${E_MARK.h}`} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path d={E_MARK.d} fill={GOLD} fillRule="evenodd" />
    </svg>
  )
}

// layout "inline": E beside ESTERICA (navbar). layout "stacked": E above ESTERICA, as on the shop sign (footer).
export default function Logo({ className = '', layout = 'inline', title = 'Esterica Fabrics' }) {
  if (layout === 'stacked') {
    const k = 1
    const w = WORDMARK.w * k
    const ex = (w - E_MARK.w) / 2
    const base = E_MARK.h + 56 + WORDMARK.cap * k
    return (
      <svg className={className} viewBox={`0 0 ${w} ${base + 4}`} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>
        <path d={E_MARK.d} fill={GOLD} fillRule="evenodd" transform={`translate(${ex} 0)`} />
        <path d={WORDMARK.d} fill={GOLD} transform={`translate(0 ${base}) scale(${k})`} />
      </svg>
    )
  }
  const k = 1.42
  const gap = 56
  const cap = WORDMARK.cap * k
  const w = E_MARK.w + gap + WORDMARK.w * k
  const base = E_MARK.h / 2 + cap / 2 + 18
  return (
    <svg className={className} viewBox={`0 0 ${w} ${E_MARK.h}`} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      <path d={E_MARK.d} fill={GOLD} fillRule="evenodd" />
      <path d={WORDMARK.d} fill={GOLD} transform={`translate(${E_MARK.w + gap} ${base}) scale(${k})`} />
    </svg>
  )
}
