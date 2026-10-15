import Logo from './Logo'
import { PhoneIcon } from './ui'
import { NAV_LINKS, PHONE_TEL } from '../config'

// No WhatsApp button here: the gold orb carries that job on every screen.
export default function Header({ solid, activeId }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-500 ${
        solid ? 'bg-charcoal/95 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)] backdrop-blur-md' : 'bg-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container-site flex h-16 items-center justify-between md:h-[76px]">
        <a href="#top" aria-label="Esterica Fabrics, back to top" className="block">
          <Logo className="h-9 w-auto md:h-11" />
        </a>
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={activeId === l.id ? 'true' : undefined}
                  className={`group relative text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeId === l.id ? 'text-gold' : 'text-cream/75 hover:text-cream'
                  }`}
                >
                  {l.label}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-0 h-px w-full origin-left border-t border-dashed border-gold transition-transform duration-300 ${
                      activeId === l.id ? 'scale-x-100 border-solid' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`tel:${PHONE_TEL}`} aria-label="Call Esterica Fabrics" className="grid h-10 w-10 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:border-gold hover:text-gold lg:hidden">
          <PhoneIcon className="h-[18px] w-[18px]" />
        </a>
      </div>
    </header>
  )
}
