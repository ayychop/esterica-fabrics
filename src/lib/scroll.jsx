import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'

const ScrollContext = createContext({ scrollTo: () => {} })

// Height of the fixed header, so anchored sections are not hidden beneath it.
const ANCHOR_OFFSET = -76

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame
    if (!reduce) {
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      lenisRef.current = lenis
      const raf = (time) => {
        lenis.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    }

    // Route every in-page anchor through Lenis.
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link) return
      const hash = link.getAttribute('href')
      if (hash.length < 2) return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      scrollTo(target)
      history.replaceState(null, '', hash)
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenisRef.current?.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = (target) => {
    const offset = target === 0 ? 0 : ANCHOR_OFFSET
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset, duration: 1.2 })
    } else {
      const top = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset
      window.scrollTo({ top, behavior: 'auto' })
    }
  }

  const stop = () => lenisRef.current?.stop()
  const start = () => lenisRef.current?.start()

  return <ScrollContext.Provider value={{ scrollTo, stop, start }}>{children}</ScrollContext.Provider>
}

export const useSmoothScroll = () => useContext(ScrollContext)

// Watches an element with IntersectionObserver (no scroll listeners).
// Returns true once the element has fully scrolled out above the viewport.
export function usePastElement(ref, rootMargin = '0px') {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return past
}
