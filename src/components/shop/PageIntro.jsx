import { Reveal } from '../ui'
import { kenteDataUri } from '../Kente'
import { Link } from '../../lib/router'

// The dark band that opens every shop page, under the fixed header.
export default function PageIntro({ eyebrow, title, accent, crumbs, children }) {
  return (
    <section className="relative overflow-hidden bg-charcoal pb-10 pt-28 text-cream md:pb-14 md:pt-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: kenteDataUri, backgroundSize: '128px 48px' }} />
      <div className="container-site relative">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-cream/60">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true" className="text-gold">/</span>}
                  {c.to ? (
                    <Link to={c.to} className="transition-colors hover:text-gold">{c.label}</Link>
                  ) : (
                    <span aria-current="page" className="text-cream">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Reveal>
          {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
          <h1 className="heading-depth-dark font-serif text-[clamp(2.6rem,6.5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.01em]">
            {title}
            {accent && <span className="accent mt-1 block pl-[0.4em] text-[0.7em] font-normal text-gold">{accent}</span>}
          </h1>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
