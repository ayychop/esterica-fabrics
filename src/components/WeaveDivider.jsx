import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion, useScroll, useTransform } from 'framer-motion'

const PALETTES = {
  gold: ['#E8B31A', '#C41E1E', '#E8B31A', '#0F7A34'],
  jewel: ['#E8B31A', '#1A4DA0', '#FAF4E4', '#C41E1E'],
  bold: ['#0A0A0A', '#C41E1E', '#FAF4E4', '#0F7A34'],
  forest: ['#E8B31A', '#0F7A34', '#E8B31A', '#0A0A0A'],
}
const HEIGHT = 37
const THREADS_Y = [12.5, 17, 22.5, 27] // four weft threads, centred in the seam
const SPACING = 34 // warp threads, kept sparse

// A woven seam across the hard edge between two colour blocks. When it enters the viewport it weaves
// itself once, left to right: each warp rises through the weft in turn and its crossings lock in.
// The threads drift a touch slower than the page (parallax); the colour split behind them stays put.
export default function WeaveDivider({ from, to, palette = 'gold' }) {
  const ref = useRef(null)
  const svgRef = useRef(null)
  const [count, setCount] = useState(0)
  const colors = PALETTES[palette]

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [-5, 5])

  useEffect(() => {
    setCount(Math.max(12, Math.round(ref.current.offsetWidth / SPACING)))
  }, [])

  useEffect(() => {
    if (!count) return
    const q = gsap.utils.selector(svgRef.current)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tl = gsap
      .timeline({ paused: true })
      .fromTo(q('.d-weft'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, stagger: 0.08, ease: 'power2.inOut' })
      .fromTo(q('.d-warp'), { scaleY: 0, transformOrigin: '50% 50%' }, { scaleY: 1, duration: 0.35, ease: 'power2.out', stagger: { each: 1.1 / count } }, 0.15)
      .fromTo(q('.d-over'), { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: { each: 1.1 / count / 2 } }, 0.35)
    if (reduce) {
      tl.progress(1)
      return () => tl.kill()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect() // once only
        tl.play()
      },
      { threshold: 0.6 },
    )
    io.observe(ref.current)
    return () => {
      io.disconnect()
      tl.kill()
    }
  }, [count])

  const x = (i) => `${((i + 0.5) / count) * 100}%`

  return (
    <div ref={ref} aria-hidden="true" className="relative overflow-hidden" style={{ height: HEIGHT, background: `linear-gradient(${from} 50%, ${to} 50%)` }}>
      <motion.svg ref={svgRef} className="absolute inset-x-0 top-0 h-full w-full" style={{ y: drift }}>
        {Array.from({ length: count }, (_, i) => (
          <line key={`w${i}`} className="d-warp" x1={x(i)} x2={x(i)} y1="9" y2="30.5" stroke={colors[(i + 1) % colors.length]} strokeWidth="2.2" />
        ))}
        {THREADS_Y.map((y, j) => (
          <line key={`t${j}`} className="d-weft" x1="0" x2="100%" y1={y} y2={y} stroke={colors[j]} strokeWidth="2.2" pathLength="1" strokeDasharray="1" />
        ))}
        {Array.from({ length: count }, (_, i) =>
          THREADS_Y.map((y, j) =>
            (i + j) % 2 ? null : (
              <line key={`o${i}-${j}`} className="d-over" x1={x(i)} x2={x(i)} y1={y - 2.2} y2={y + 2.2} stroke={colors[(i + 1) % colors.length]} strokeWidth="2.2" />
            ),
          ),
        )}
      </motion.svg>
    </div>
  )
}
