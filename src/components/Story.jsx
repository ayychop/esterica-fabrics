import { useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from './ui'
import { KenteWatermark } from './Kente'
import { createKenteCanvas, INDIGO_PALETTE } from '../lib/kenteTexture'

// The cloth itself, full bleed: an indigo Ewe style Kente, strips running across, distinct from
// the gold hero cloth. It pans slowly and soft drape light drifts over it. No photograph, no faces.
function KenteDrape() {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    setSrc(createKenteCanvas({ size: 640, strips: 6, seed: 33, palette: INDIGO_PALETTE, rotate: true }).toDataURL('image/jpeg', 0.86))
  }, [])
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-charcoal">
      {src && <div className="cloth-pan absolute -inset-[12%]" style={{ backgroundImage: `url(${src})`, backgroundSize: '480px 480px' }} />}
      <div
        className="drape-light absolute inset-y-0 -left-1/2 w-[200%]"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0) 70px, rgba(255,236,190,0.16) 110px, rgba(0,0,0,0) 150px, rgba(0,0,0,0.38) 220px)',
        }}
      />
      {/* where the cloth meets the indigo, it falls into shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo/70 via-transparent to-transparent lg:bg-gradient-to-l lg:from-indigo/80 lg:via-transparent" />
    </div>
  )
}

// A three strand braid (gold, red, green) laid in the gap between the two lines of the quote.
// Each strand is cut into short segments painted in depth order, so the crossings truly go over and
// under. It braids itself left to right once as the quote comes into view, then rests.
const BRAID = (() => {
  const W = 1000
  const CY = 22
  const AMP = 9
  const CYCLES = 9
  const N = 260
  const strands = [
    { color: '#E8B31A', phase: 0 },
    { color: '#C41E1E', phase: (Math.PI * 2) / 3 },
    { color: '#0F7A34', phase: (Math.PI * 4) / 3 },
  ]
  const at = (t, phase) => {
    const env = Math.min(1, t * 8, (1 - t) * 8) // the cord gathers to a point at each end
    return [t * W, CY + Math.sin(Math.PI * 2 * CYCLES * t + phase) * AMP * env]
  }
  const segs = []
  strands.forEach((s, k) => {
    for (let i = 0; i < N; i++) {
      const [x1, y1] = at(i / N, s.phase)
      const [x2, y2] = at((i + 1) / N, s.phase)
      const depth = Math.cos(Math.PI * 2 * CYCLES * ((i + 0.5) / N) + s.phase)
      segs.push({ key: `${k}-${i}`, x1, y1, x2, y2, depth, color: s.color })
    }
  })
  return { W, H: 44, segs: segs.sort((a, b) => a.depth - b.depth) }
})()

function Braid({ compact = false }) {
  const id = useId().replace(/:/g, '')
  return (
    <motion.svg
      aria-hidden="true"
      viewBox={`0 0 ${BRAID.W} ${BRAID.H}`}
      className={`my-2 block h-8 md:my-3 md:h-11 ${compact ? 'mx-auto w-full max-w-[38rem] lg:mx-0' : 'mx-auto w-[min(100%,52rem)]'}`}
      preserveAspectRatio="none"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 1 }}
    >
      <defs>
        <clipPath id={`braid-${id}`}>
          {/* the observer watches the visible svg; the clip inside follows through variants */}
          <motion.rect
            x="0"
            y="0"
            height={BRAID.H}
            variants={{ hidden: { width: 0 }, shown: { width: BRAID.W } }}
            transition={{ duration: 2.2, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#braid-${id})`} strokeLinecap="round">
        {BRAID.segs.map((s) => (
          <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.color} strokeWidth="3.4" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </motion.svg>
  )
}

function WovenQuote({ compact = false }) {
  const size = compact ? 'text-[clamp(2.5rem,5.2vw,5.2rem)]' : 'text-[clamp(2.7rem,7.5vw,7.4rem)]'
  return (
    <figure className={compact ? 'text-center lg:text-left' : 'mx-auto max-w-6xl text-center'}>
      <Reveal as="blockquote">
        <p className={`accent ${size} leading-[0.95] text-gold-light`}>Every thread</p>
        <Braid compact={compact} />
        <p className={`accent ${size} leading-[0.95] text-cream`}>carries a memory.</p>
      </Reveal>
    </figure>
  )
}

function StoryText() {
  return (
    <>
          <Reveal className="relative">
            <p className="eyebrow text-gold">Heritage, woven</p>
            <h2 className="heading-depth-dark font-serif text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.015em]">
              Our <span className="accent font-normal text-gold-light">Story</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="relative mt-7 max-w-2xl space-y-4 text-[17px] leading-relaxed text-cream/85">
            <p className="font-serif text-2xl leading-snug text-cream">
              Esterica Fabrics began with a simple love for Kente, the woven cloth of Ghana worn for weddings, naming ceremonies, graduations and every moment worth remembering.
            </p>
            <p>
              We source authentic Kente from trusted weavers, choosing each piece by hand for its colour, its pattern and the quality of its weave. Then we bring it to London, so you never have to compromise.
            </p>
            <p>
              From our Wembley unit we serve tailors, designers, families and the wider African community across the UK and around the world. Whether you need two metres or twenty, we are here to help you find the right cloth.
            </p>
          </Reveal>
    </>
  )
}

export default function Story() {
  // The cloth runs the full height of the section, bleeding off the left edge; story and quote beside it
  return (
    <section id="story" className="relative overflow-hidden bg-indigo text-cream">
      <div className="relative grid lg:grid-cols-12">
        <div className="relative h-[29vh] min-h-[200px] lg:col-span-5 lg:h-auto">
          <KenteDrape />
        </div>
        <div className="relative px-5 py-12 sm:px-8 md:py-14 lg:col-span-7 lg:pl-16 xl:pl-20">
          <KenteWatermark className="-right-40 -top-10" color="#E8B31A" opacity={0.08} size={560} />
          <StoryText />
          <div className="relative mt-10 md:mt-12">
            <WovenQuote compact />
          </div>
        </div>
      </div>
    </section>
  )
}
