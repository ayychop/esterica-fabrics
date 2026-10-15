import { useEffect, useState } from 'react'
import { openStatus } from '../lib/openStatus'

// Live open or closed status from the real time in London. Used in the hero and in Visit Us,
// so both always say the same thing. Refreshes every 30 seconds.
export default function OpenBadge({ large = false, className = '' }) {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    const tick = () => setStatus(openStatus())
    tick()
    const t = setInterval(tick, 30000)
    return () => clearInterval(t)
  }, [])

  if (!status) return <div aria-hidden="true" className={large ? 'h-[34px]' : 'h-[28px]'} />

  const tone = status.open
    ? { border: 'border-gold/80', dot: 'bg-gold', label: 'text-gold' }
    : { border: 'border-crimson/80', dot: 'bg-crimson', label: 'text-[#FF8A7A]' }

  return (
    <p
      role="status"
      aria-live="polite"
      className={`inline-flex items-center whitespace-nowrap rounded-full border bg-charcoal/90 font-semibold uppercase leading-none tracking-[0.22em] text-cream backdrop-blur-sm ${tone.border} ${
        large ? 'gap-3 px-[18px] py-[8px] text-[12.5px]' : 'gap-2.5 px-3.5 py-[6px] text-[10.5px]'
      } ${className}`}
    >
      <span className={`relative flex ${large ? 'h-[8.5px] w-[8.5px]' : 'h-[7px] w-[7px]'}`}>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${tone.dot}`} />
        <span className={`relative inline-flex h-full w-full rounded-full ${tone.dot}`} />
      </span>
      <span>
        <span className={tone.label}>{status.label}</span>
        <span className="mx-1.5 text-cream/40">·</span>
        <span className="text-cream/85">{status.detail}</span>
      </span>
    </p>
  )
}
