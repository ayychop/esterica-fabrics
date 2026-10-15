import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { KENTE_TILE } from './Kente'
import { WORDMARK_LETTERS as WM } from './wordmarkLetters'

const KEY = 'esterica-intro-played'

// Inside lettering on a dark ground the cloth's black would read as holes in the letters,
// so here it is woven in deep amber instead; gold, red, green and indigo stay as they are.
const LETTER_TILE = KENTE_TILE.svg.replaceAll('#0A0A0A', '#B98900')

export function introAlreadyPlayed() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// "Esterica Fabrics", set large and filled with Kente. Each letter wipes in from top to bottom in
// gold, left to right, and as its wipe completes the woven cloth blooms inside it. The cloth keeps
// drifting through the letters while the wordmark holds, then the card lifts away. All vector.
//   0.00 to 2.56s  letters wipe in, one every 160ms (100ms + 60ms gap), easeInOutCubic
//   to ~2.95s      Kente has bloomed in the last letter
//   2.95 to 3.75s  hold (800ms), the cloth drifting
//   3.75 to 4.25s  the card fades out upward
const STEP = 0.16
const WIPE = 0.32
const BLOOM = 0.4
const HOLD = 0.8

// Wide screens: one line. Narrow screens: Esterica over Fabrics, so the letters stay large.
function layout() {
  const wide = window.innerWidth / window.innerHeight > 0.9
  const gap = WM.space * 1.3
  if (wide) {
    const total = WM.esterica.width + gap + WM.fabrics.width
    return { wide, words: [{ x: 0, y: 0 }, { x: WM.esterica.width + gap, y: 0 }], vb: [-12, -175, total + 24, 205] }
  }
  const w = Math.max(WM.esterica.width, WM.fabrics.width)
  return {
    wide,
    words: [
      { x: (w - WM.esterica.width) / 2, y: 0 },
      { x: (w - WM.fabrics.width) / 2 + 20, y: 210 },
    ],
    vb: [-12, -175, w + 24, 415],
  }
}

export default function IntroLoader({ onReveal, onDone }) {
  const root = useRef(null)
  const [gone, setGone] = useState(false)
  const [lay] = useState(layout)
  const letters = [
    ...WM.esterica.letters.map((l) => ({ ...l, word: 0 })),
    ...WM.fabrics.letters.map((l) => ({ ...l, word: 1 })),
  ]
  const scale = 1.45 // Kente tile size inside the letters: small enough to read as woven cloth
  const tileW = KENTE_TILE.w * scale
  const [vx, vy, vw, vh] = lay.vb

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveal = () => {
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* private mode, the intro may play again */
      }
      onReveal()
    }
    const finish = () => {
      setGone(true)
      onDone()
    }

    let tl
    let drift
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const wipes = q('.wipe')
      const blooms = q('.bloom')
      wipes.forEach((r) => r.setAttribute('height', 0))
      gsap.set(blooms, { opacity: 0 })

      // the cloth drifts slowly through the letters the whole time
      drift = gsap.to(q('.weave'), { x: -tileW, duration: 9, ease: 'none', repeat: -1 })

      tl = gsap.timeline({ paused: true, onComplete: finish })
      if (reduce) {
        wipes.forEach((r) => r.setAttribute('height', r.dataset.h))
        tl.set(blooms, { opacity: 1 }).to({}, { duration: 0.8 }).call(reveal).to(root.current, { opacity: 0, duration: 0.4 })
        return
      }

      wipes.forEach((r, i) => {
        tl.to(r, { attr: { height: +r.dataset.h }, duration: WIPE, ease: 'power2.inOut' }, i * STEP)
        tl.to(blooms[i], { opacity: 1, duration: BLOOM, ease: 'power2.inOut' }, i * STEP + WIPE - 0.02)
      })
      const shown = (wipes.length - 1) * STEP + WIPE + BLOOM
      tl.call(reveal, [], shown + HOLD).to(root.current, { opacity: 0, y: -48, duration: 0.5, ease: 'power2.inOut' }, shown + HOLD)
    }, root)

    // Development only: tests can hold the intro (window.__introHold) and scrub its timeline.
    if (import.meta.env.DEV) window.__introTimeline = tl
    const held = import.meta.env.DEV && window.__introHold

    let begun = false
    let cancelled = false
    const start = () => {
      if (begun || cancelled || held) return
      begun = true
      tl.play()
    }
    document.fonts?.ready.then(start)
    const t = setTimeout(start, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
      drift?.kill()
      ctx.revert()
    }
  }, [onReveal, onDone, tileW])

  if (gone) return null

  const place = (l) => `translate(${lay.words[l.word].x} ${lay.words[l.word].y})`

  return (
    <div ref={root} role="status" aria-label="Loading Esterica Fabrics" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]">
      <svg
        aria-hidden="true"
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        className={lay.wide ? 'w-[80vw] max-h-[70vh]' : 'w-[84vw] max-h-[70vh]'}
        shapeRendering="geometricPrecision"
      >
        <defs>
          <pattern id="wm-kente" width={KENTE_TILE.w} height={KENTE_TILE.h} patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
            <g dangerouslySetInnerHTML={{ __html: LETTER_TILE }} />
          </pattern>
          <linearGradient id="wm-gold" x1="0" y1={vy} x2="0" y2={vy + vh} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFD84D" />
            <stop offset="1" stopColor="#E8B31A" />
          </linearGradient>
          {/* a soft light across the top of the letters, shadow toward the base: cloth, not a flat fill */}
          {lay.words.map((w, i) => (
            <linearGradient key={i} id={`wm-sheen-${i}`} x1="0" y1={w.y - 150} x2="0" y2={w.y + 10} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.32" />
            </linearGradient>
          ))}

          {/* each letter's wipe: a rect that grows downward from the letter's top */}
          {letters.map((l, i) => (
            <clipPath key={i} id={`wm-wipe-${i}`} clipPathUnits="userSpaceOnUse">
              <rect className="wipe" x={l.x0 - 8} y={l.y0 - 8} width={l.x1 - l.x0 + 16} height="0" data-h={l.y1 - l.y0 + 16} />
            </clipPath>
          ))}
          {/* gold: letters as far as their wipes have reached */}
          <mask id="wm-gold-mask" maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
            {letters.map((l, i) => (
              <path key={i} d={l.d} transform={place(l)} fill="#fff" clipPath={`url(#wm-wipe-${i})`} />
            ))}
          </mask>
          {/* Kente: each letter blooms once its wipe completes */}
          <mask id="wm-kente-mask" maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
            {letters.map((l, i) => (
              <path key={i} className="bloom" d={l.d} transform={place(l)} fill="#fff" />
            ))}
          </mask>
        </defs>

        <rect x={vx} y={vy} width={vw} height={vh} fill="url(#wm-gold)" mask="url(#wm-gold-mask)" />
        <g mask="url(#wm-kente-mask)">
          <rect className="weave" x={vx - tileW} y={vy} width={vw + tileW * 3} height={vh} fill="url(#wm-kente)" />
          {lay.words.map((w, i) => (
            <rect key={i} x={vx} y={w.y - 175} width={vw} height="205" fill={`url(#wm-sheen-${i})`} />
          ))}
        </g>
        {/* a fine gold edge keeps every letterform crisp where the cloth runs dark */}
        <g fill="none" stroke="#E8B31A" strokeOpacity="0.5" strokeWidth="1.4" mask="url(#wm-gold-mask)">
          {letters.map((l, i) => (
            <path key={i} d={l.d} transform={place(l)} />
          ))}
        </g>
      </svg>
    </div>
  )
}
