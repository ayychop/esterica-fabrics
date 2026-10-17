import { motion } from 'framer-motion'
import { Link } from '../../lib/router'

const EASE = [0.22, 1, 0.36, 1]

// The cream, editorial opening of the cart and checkout: a quiet trail, one huge serif title, one small line.
export default function PageTitle({ title, line, crumbs }) {
  const show = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: EASE },
  })
  return (
    <header className="pb-10 pt-28 md:pb-16 md:pt-40">
      {crumbs && (
        <motion.nav {...show(0)} aria-label="Breadcrumb" className="mb-6 text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal/65">
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-crimson">/</span>}
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-crimson">{c.label}</Link>
                ) : (
                  <span aria-current="page" className="text-charcoal">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </motion.nav>
      )}
      <motion.h1 {...show(0.08)} className="font-serif text-[clamp(3.2rem,9vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-charcoal">
        {title}
      </motion.h1>
      {line && (
        <motion.p {...show(0.18)} className="mt-5 text-[12px] font-semibold uppercase tracking-[0.3em] text-charcoal/65">
          {line}
        </motion.p>
      )}
    </header>
  )
}
