import { motion } from 'framer-motion'
import { kenteDataUri } from './Kente'

const LINES = [
  { text: 'Woven in Ghana.', cls: 'font-serif font-semibold text-cream', indent: '' },
  { text: 'Worn across generations.', cls: 'accent text-gold', indent: 'pl-[6vw]' },
  { text: 'Carried to London, metre by metre.', cls: 'font-serif font-semibold text-cream', indent: 'pl-[2vw]' },
]

// A short heritage statement, set huge. Each line rises out of its own woven band, once.
export default function Statement() {
  return (
    <section aria-label="Kente heritage" className="relative overflow-hidden bg-charcoal pb-10 pt-7 md:pb-14 md:pt-10">
      <div className="container-site">
        <div aria-hidden="true" className="mb-4 flex gap-1.5 md:mb-5">
          {['#E8B31A', '#C41E1E', '#0F7A34'].map((c, i) => (
            <motion.span
              key={c}
              className="block h-[3px] w-16 origin-left md:w-24"
              style={{ background: c }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}
        </div>
        {/* The observer watches the whole statement; each line is masked inside its own band. */}
        <motion.p
          className="text-[clamp(1.7rem,3.7vw,3.6rem)] leading-[0.94] tracking-[-0.01em]"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } } }}
        >
          {LINES.map((l) => (
            <span key={l.text} className={`block overflow-hidden pb-[0.08em] ${l.indent}`}>
              <motion.span
                className={`heading-depth-dark block ${l.cls}`}
                variants={{ hidden: { y: '105%' }, shown: { y: 0 } }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {l.text}
              </motion.span>
            </span>
          ))}
        </motion.p>
      </div>

      {/* A woven ribbon drifting along the foot of the band: two 2560px copies (80 whole tiles each) side by side, looping at -50% */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-3 h-[12px] overflow-hidden opacity-90 md:bottom-4">
        <div className="ribbon-drift flex h-full w-[5120px]">
          <div className="h-full w-[2560px]" style={{ backgroundImage: kenteDataUri, backgroundSize: '32px 12px', backgroundRepeat: 'repeat-x' }} />
          <div className="h-full w-[2560px]" style={{ backgroundImage: kenteDataUri, backgroundSize: '32px 12px', backgroundRepeat: 'repeat-x' }} />
        </div>
      </div>
    </section>
  )
}
