import { useEffect, useState } from 'react'
import { openStatus } from '../lib/openStatus'

// One shared clock for every badge, so the hero and Visit Us flip together. It ticks on each
// minute boundary (not every 60s from mount), so the time and the open/closed switch are never late.
const listeners = new Set()
let current = null
let timer

function tick() {
  current = openStatus()
  listeners.forEach((fn) => fn(current))
  clearTimeout(timer)
  timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
}

// Background tabs throttle timers, so catch up as soon as the page is visible again.
const onVisible = () => document.visibilityState === 'visible' && tick()

function useOpenStatus() {
  const [status, setStatus] = useState(current)
  useEffect(() => {
    if (listeners.size === 0) {
      tick()
      document.addEventListener('visibilitychange', onVisible)
    }
    listeners.add(setStatus)
    setStatus(current)
    return () => {
      listeners.delete(setStatus)
      if (listeners.size === 0) {
        clearTimeout(timer)
        document.removeEventListener('visibilitychange', onVisible)
      }
    }
  }, [])
  return status
}

// Live open or closed status from the real time in London (Europe/London), whatever the visitor's timezone.
// Used in the hero and in Visit Us.
export default function OpenBadge({ large = false, className = '' }) {
  const status = useOpenStatus()

  if (!status) return <div aria-hidden="true" className={large ? 'h-[34px]' : 'h-[28px]'} />

  const tone = status.open
    ? { border: 'border-gold', dot: 'bg-[#22B455]', label: 'text-[#4FD97E]' }
    : { border: 'border-[#A3304A]', dot: 'bg-crimson', label: 'text-[#FF8A7A]' }

  return (
    <p
      role="status"
      aria-live="polite"
      className={`inline-flex items-center whitespace-nowrap rounded-full border-[1.5px] bg-charcoal/90 font-semibold uppercase leading-none tracking-[0.22em] text-cream backdrop-blur-sm ${tone.border} ${
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
