import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { WORDMARK } from './logoPaths'

const KEY = 'esterica-intro-played'

// easeInOutExpo: slow to leave, fast through the middle, slow to settle. Deliberate, never linear.
const EXPO = [0.87, 0, 0.13, 1]
const THREAD_COLOURS = ['#E8B31A', '#C41E1E', '#0F7A34']

// The sequence, in seconds (2.5 in all):
//   0.0 to 1.0  fine Kente threads drop from the top, like a curtain being drawn
//   1.0 to 1.5  ESTERICA lifts into view through a mask
//   1.5 to 2.0  it holds, and FABRICS · LONDON fades in beneath it
//   2.0 to 2.5  the whole card wipes up and away to the homepage
const T = { threadsEnd: 1.0, markStart: 0.95, markDur: 0.55, lineStart: 1.5, lineDur: 0.45, exitStart: 2.0, exitDur: 0.5 }

export function introAlreadyPlayed() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Whether the intro should play at all: once per browser session, and never for reduced motion.
export function shouldPlayIntro() {
  return !introAlreadyPlayed() && !prefersReducedMotion()
}

function markPlayed() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* private mode: the intro may play again on the next visit */
  }
}

// A seeded scatter, so the threads fall in the same lovely order on every visit.
const jitter = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function useThreads() {
  return useMemo(() => {
    const count = Math.min(34, Math.max(12, Math.round(window.innerWidth / 46)))
    return Array.from({ length: count }, (_, i) => {
      const fall = 0.62 + jitter(i, 1) * 0.12 // each thread's drop
      return {
        left: `${((i + 0.5 + (jitter(i, 2) - 0.5) * 0.5) / count) * 100}%`,
        width: jitter(i, 3) > 0.55 ? 2.5 : 1.5,
        colour: THREAD_COLOURS[i % THREAD_COLOURS.length],
        duration: fall,
        delay: jitter(i, 4) * (T.threadsEnd - fall), // every thread is down by 1.0s
      }
    })
  }, [])
}

// Hold on the plain charcoal card until the homepage underneath has finished its first busy moment
// (mounting, decoding, fonts), so the threads fall on a quiet main thread. Never waits more than 0.7s.
function useQuietStart() {
  const [go, setGo] = useState(false)
  useEffect(() => {
    let done = false
    const start = () => !done && (done = true) && requestAnimationFrame(() => setGo(true))
    const idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 700 }) : setTimeout(start, 300)
    const cap = setTimeout(start, 700)
    return () => {
      done = true
      clearTimeout(cap)
      window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle)
    }
  }, [])
  return go
}

export default function IntroLoader({ onReveal, onDone }) {
  const threads = useThreads()
  const go = useQuietStart()
  const [leaving, setLeaving] = useState(false)

  const left = useRef(false)
  const leave = useCallback(() => {
    if (left.current) return
    left.current = true
    setLeaving(true)
    onReveal() // the hero starts its own entrance as the card lifts
  }, [onReveal])

  // Remember straight away, so a refresh part way through skips to the site.
  useEffect(markPlayed, [])

  // The sequence clock starts with the threads, so the hold is never cut short by a slow page start.
  useEffect(() => {
    if (!go) return
    const t = setTimeout(leave, T.exitStart * 1000)
    return () => clearTimeout(t)
  }, [go, leave])

  return (
    <motion.div
      role="status"
      aria-label="Loading Esterica Fabrics"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#121212]"
      initial={{ y: 0 }}
      animate={{ y: leaving ? '-100%' : 0 }}
      transition={{ duration: T.exitDur, ease: EXPO }}
      onAnimationComplete={() => leaving && onDone()}
    >
      {/* The curtain of threads: GPU-only scaleY from the top edge */}
      <div aria-hidden="true" className="absolute inset-0">
        {threads.map((t, i) => (
          <motion.span
            key={i}
            className="absolute top-0 h-full origin-top will-change-transform"
            style={{ left: t.left, width: t.width, background: t.colour }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: go ? 1 : 0 }}
            transition={{ duration: t.duration, delay: t.delay, ease: EXPO }}
          />
        ))}
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        {/* The wordmark lifts into view inside its own window, carrying a dark plate that parts the threads */}
        <div className="overflow-hidden">
          <motion.div
            className="bg-[#121212] px-[4vw] py-[2.2vw] md:px-10 md:py-7"
            initial={{ y: '101%' }}
            animate={{ y: go ? 0 : '101%' }}
            transition={{ duration: T.markDur, delay: T.markStart, ease: EXPO }}
          >
            <svg
              viewBox={`0 ${-WORDMARK.cap - 4} ${WORDMARK.w} ${WORDMARK.cap + 8}`}
              className="block h-auto w-[min(72vw,560px)]"
              role="img"
              aria-label="Esterica"
            >
              <path d={WORDMARK.d} fill="#E8B31A" />
            </svg>
          </motion.div>
        </div>

        <motion.p
          className="mt-3 bg-[#121212] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.5em] text-gold md:mt-4 md:text-[13px]"
          initial={{ opacity: 0, y: 8 }}
          animate={go ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: T.lineDur, delay: T.lineStart, ease: [0.22, 1, 0.36, 1] }}
        >
          Fabrics <span aria-hidden="true">·</span> London
        </motion.p>
      </div>
    </motion.div>
  )
}
