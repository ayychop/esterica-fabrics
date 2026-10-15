import { Suspense, forwardRef, lazy, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { WhatsAppIcon, PinIcon } from '../ui'
import { whatsappLink } from '../../config'
import { getHeroKente } from '../../lib/kenteTexture'
import OpenBadge from '../OpenBadge'

// three.js is only fetched if this device is going to use it.
const FabricCanvas = lazy(() => import('./FabricCanvas'))

function canRunCloth() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Fallback cloth: the same generated Kente, cut into vertical slats that swing in sequence,
// so a wave rolls across it. Transform only, no WebGL.
const SLATS = 18
function KenteFallback() {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    setSrc(getHeroKente().toDataURL('image/jpeg', 0.85))
  }, [])
  return (
    <div
      aria-hidden="true"
      className="absolute left-[5%] right-[5%] top-[9%] h-[52%] md:left-auto md:right-[7%] md:top-[13%] md:h-[86%] md:w-[min(50vw,68vh)]"
    >
      <div className="absolute -left-[50vw] -right-[20vw] -top-1 h-[3px] rounded-full bg-gold-light/90" />
      <div className="flex h-full w-full" style={{ perspective: '900px' }}>
        {src &&
          Array.from({ length: SLATS }, (_, i) => (
            <div
              key={i}
              className="cloth-slat relative h-full flex-1"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${SLATS * 100}% 100%`,
                backgroundPosition: `${(i / (SLATS - 1)) * 100}% 0`,
                animationDelay: `${-i * 0.16}s`,
              }}
            />
          ))}
      </div>
    </div>
  )
}

const Hero = forwardRef(function Hero({ ready }, ref) {
  const sectionRef = useRef(null)
  useImperativeHandle(ref, () => sectionRef.current)

  const [mode, setMode] = useState(() => (canRunCloth() ? 'loading' : 'fallback')) // 'fallback' | 'loading' | 'webgl'
  const [visible, setVisible] = useState(true)
  const [compact] = useState(() => window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  const show = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <section id="top" ref={sectionRef} className="relative isolate min-h-[100svh] overflow-hidden bg-charcoal">
      {/* Gold light behind the cloth */}
      <div
        aria-hidden="true"
        className="kente-glow absolute -z-10 h-[90vmax] w-[90vmax] max-md:left-1/2 max-md:top-[8%] max-md:-translate-x-1/2 md:right-[-12%] md:top-[-20%]"
        style={{ background: 'radial-gradient(circle, rgba(232,179,26,0.42) 0%, rgba(232,179,26,0.12) 35%, transparent 62%)' }}
      />

      {/* The CSS cloth only appears when WebGL is unavailable or gives up, never as a placeholder,
          so the hero never shows one cloth and then swaps to another. */}
      {mode === 'fallback' && (
        <div className="absolute inset-0">
          <KenteFallback />
        </div>
      )}

      {mode !== 'fallback' && (
        <div className={`absolute inset-0 transition-opacity duration-[1400ms] will-change-[opacity] ${mode === 'webgl' ? 'opacity-100' : 'opacity-0'}`}>
          <Suspense fallback={null}>
            <FabricCanvas
              eventSource={sectionRef}
              active={visible}
              compact={compact}
              onReady={() => setMode('webgl')}
              onFail={() => setMode('fallback')}
            />
          </Suspense>
        </div>
      )}

      {/* Legibility veil: from the left on desktop, from the bottom on phones */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: 'linear-gradient(90deg, #121212 0%, rgba(18,18,18,0.92) 26%, rgba(18,18,18,0.35) 46%, transparent 60%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ background: 'linear-gradient(0deg, #121212 0%, #121212 40%, rgba(18,18,18,0.88) 52%, rgba(18,18,18,0.35) 64%, transparent 76%)' }}
      />

      <div className="pointer-events-none container-site relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24">
        <div className="max-w-[34rem] lg:max-w-[40%]">
          {/* Live status, top left, directly above the eyebrow */}
          <motion.div {...show(0)} className="pointer-events-auto mb-5">
            <OpenBadge large />
          </motion.div>
          <motion.p {...show(0.05)} className="eyebrow text-gold">
            Kente cloth house · Wembley
          </motion.p>
          <h1 className="font-serif text-cream">
            <motion.span {...show(0.12)} className="block text-[clamp(3.4rem,9vw,7.6rem)] font-semibold leading-[0.9] tracking-[-0.01em]">
              <span className="heading-depth-dark">Esterica</span>
            </motion.span>
            <motion.span {...show(0.24)} className="accent block pl-[0.6em] text-[clamp(3rem,8vw,6.8rem)] leading-[0.95] text-gold">
              Fabrics
            </motion.span>
          </h1>
          <motion.p {...show(0.4)} className="mt-8 text-[13px] font-semibold uppercase tracking-[0.26em] text-cream">
            Authentic Kente Cloth. Sold by the Metre.
          </motion.p>
          <motion.p {...show(0.5)} className="accent mt-3 max-w-md text-[1.45rem] leading-snug text-cream/75">
            Handpicked fabrics for tailors, designers, and lovers of African heritage.
          </motion.p>
          <motion.div {...show(0.64)} className="pointer-events-auto mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-gold">
              <WhatsAppIcon /> Enquire on WhatsApp
            </a>
            <a href="#visit" className="btn-outline-light">
              <PinIcon /> Visit Us
            </a>
          </motion.div>
        </div>
      </div>

      {mode === 'webgl' && (
        <motion.p
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 1.6, duration: 1.2 }}
          className="accent pointer-events-none absolute bottom-12 left-[44%] hidden text-xl text-cream/60 lg:block"
        >
          Touch the cloth.
        </motion.p>
      )}
    </section>
  )
})

export default Hero
