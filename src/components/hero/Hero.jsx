import { Component, Suspense, forwardRef, lazy, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { WhatsAppIcon, BagIcon } from '../ui'
import { whatsappLink } from '../../config'
import { Link } from '../../lib/router'
import OpenBadge from '../OpenBadge'

const FabricCanvas = lazy(() => import('./FabricCanvas'))

// If the browser cannot create a WebGL context at all, the hero simply shows no cloth
// rather than a different one: there is only ever one fabric.
class NoClothOnError extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const Hero = forwardRef(function Hero({ ready }, ref) {
  const sectionRef = useRef(null)
  useImperativeHandle(ref, () => sectionRef.current)

  const [ready3d, setReady3d] = useState(false)
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
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

      {/* The one and only cloth: hung from its clips, fringed at the hem, moving with the pointer.
          Nothing is shown before it and nothing ever replaces it. */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready3d ? 'opacity-100' : 'opacity-0'}`}>
        <NoClothOnError>
          <Suspense fallback={null}>
            <FabricCanvas eventSource={sectionRef} active={visible} compact={compact} still={still} onReady={() => setReady3d(true)} />
          </Suspense>
        </NoClothOnError>
      </div>

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
          {/* On phones the fabric runs behind this line, so it sits on its own solid dark band */}
          <motion.p {...show(0.05)} className="eyebrow text-gold max-md:w-fit max-md:rounded-full max-md:bg-[#121212]/90 max-md:px-3.5 max-md:py-2 max-md:[text-shadow:0_1px_2px_#000]">
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
            <Link to="/shop" className="btn-gold">
              <BagIcon /> Shop the Collection
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
              <WhatsAppIcon /> Enquire on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>

      {ready3d && !still && (
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
