// Kente inspired geometry: alternating warp stripe panels and weft blocks,
// the way strips are woven and sewn together in real Asante and Ewe cloth.
const C = {
  gold: '#E8B31A',
  crimson: '#C41E1E',
  forest: '#0F7A34',
  indigo: '#1A4DA0',
  ink: '#0A0A0A',
  cream: '#FAF4E4',
}

const checker = (x0, y0, cols, rows, size, a, b) =>
  Array.from({ length: cols * rows }, (_, i) => {
    const cx = i % cols
    const cy = Math.floor(i / cols)
    return `<rect x="${x0 + cx * size}" y="${y0 + cy * size}" width="${size}" height="${size}" fill="${(cx + cy) % 2 ? b : a}"/>`
  }).join('')

// One 128 x 48 tile, seamless horizontally.
const TILE = `
<rect width="128" height="48" fill="${C.gold}"/>
<rect x="4" width="5" height="48" fill="${C.forest}"/>
<rect x="11" width="2" height="48" fill="${C.ink}"/>
<rect x="15" width="5" height="48" fill="${C.crimson}"/>
<rect x="22" width="2" height="48" fill="${C.ink}"/>
<rect x="26" width="5" height="48" fill="${C.forest}"/>
<rect x="36" width="28" height="48" fill="${C.ink}"/>
${checker(36, 6, 7, 2, 4, C.gold, C.ink)}
<path d="M36 34 L43 22 L50 34 L57 22 L64 34" fill="none" stroke="${C.gold}" stroke-width="3"/>
${checker(36, 38, 7, 1, 4, C.crimson, C.ink)}
<rect x="64" width="28" height="48" fill="${C.indigo}"/>
<rect x="64" y="20" width="28" height="8" fill="${C.gold}"/>
<rect x="72" y="8" width="12" height="32" fill="${C.gold}"/>
<rect x="75" y="11" width="6" height="26" fill="${C.crimson}"/>
<rect x="64" y="23" width="28" height="2" fill="${C.ink}"/>
<rect x="97" width="5" height="48" fill="${C.crimson}"/>
<rect x="104" width="2" height="48" fill="${C.ink}"/>
<rect x="108" width="5" height="48" fill="${C.forest}"/>
<rect x="115" width="2" height="48" fill="${C.ink}"/>
<rect x="119" width="5" height="48" fill="${C.crimson}"/>
<rect y="0" width="128" height="3" fill="${C.ink}"/>
<rect y="45" width="128" height="3" fill="${C.ink}"/>
`


export const kenteDataUri = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="48" viewBox="0 0 128 48">${TILE}</svg>`,
)}")`

export function KenteStrip({ height = 28, className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ height, backgroundImage: kenteDataUri, backgroundRepeat: 'repeat-x', backgroundSize: `auto ${height}px` }}
    />
  )
}

// A woven border around key images.
export function KenteFrame({ children, className = '', border = 12 }) {
  return (
    <div
      className={`relative shadow-[0_30px_60px_-30px_rgba(10,10,10,0.55)] ${className}`}
      style={{ padding: border, backgroundImage: kenteDataUri, backgroundSize: '96px 36px' }}
    >
      {children}
    </div>
  )
}

// Large diamond medallion used as a background watermark (scaled down on mobile via .watermark).
export function KenteWatermark({ className = '', color = C.gold, opacity = 0.08, size = 560 }) {
  return (
    <svg
      aria-hidden="true"
      className={`watermark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ opacity }}
    >
      <g fill="none" stroke={color} strokeWidth="3">
        <rect x="30" y="30" width="140" height="140" transform="rotate(45 100 100)" />
        <rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)" />
        <rect x="70" y="70" width="60" height="60" transform="rotate(45 100 100)" />
        <path d="M100 0 V200 M0 100 H200" strokeDasharray="6 6" />
      </g>
      <g fill={color}>
        <rect x="88" y="88" width="24" height="24" transform="rotate(45 100 100)" />
        {[0, 90, 180, 270].map((r) => (
          <g key={r} transform={`rotate(${r} 100 100)`}>
            <rect x="94" y="6" width="12" height="12" />
            <rect x="94" y="24" width="12" height="6" />
            <path d="M84 40 L100 52 L116 40" fill="none" stroke={color} strokeWidth="4" />
          </g>
        ))}
      </g>
    </svg>
  )
}

export const KENTE_COLORS = C

// A thin woven rule: a gold weft with red and green warps crossing over and under it.
const RULE_TILE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="8" viewBox="0 0 24 8"><rect y="3" width="24" height="2" fill="${C.gold}"/><rect x="4" width="2" height="8" fill="${C.crimson}"/><rect x="16" width="2" height="3" fill="${C.forest}"/><rect x="16" y="5" width="2" height="3" fill="${C.forest}"/></svg>`
export const wovenRuleUri = `url("data:image/svg+xml,${encodeURIComponent(RULE_TILE)}")`

export function WovenRule({ className = '' }) {
  return <div aria-hidden="true" className={`h-2 ${className}`} style={{ backgroundImage: wovenRuleUri, backgroundSize: '24px 8px', backgroundRepeat: 'repeat-x' }} />
}
