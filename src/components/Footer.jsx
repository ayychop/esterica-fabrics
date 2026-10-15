import Logo from './Logo'
import { useConsent } from '../lib/consent'
import { ADDRESS_LINES, HOURS, PHONE_DISPLAY, PHONE_TEL } from '../config'

export default function Footer({ onLegal }) {
  const { openSettings } = useConsent()
  const linkCls = 'text-cream/70 underline-offset-4 transition-colors hover:text-gold hover:underline'
  return (
    <footer className="bg-ink pb-20 text-cream md:pb-0">
      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4 md:py-12">
        <div className="col-span-2">
          <Logo layout="stacked" className="h-20 w-auto md:h-24" />
          <p className="accent mt-4 max-w-sm text-xl leading-snug text-cream/70 md:text-2xl">
            Authentic Kente cloth, sold by the metre. Handpicked for tailors, designers and lovers of African heritage.
          </p>
        </div>
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Find Us</h2>
          <address className="mt-4 not-italic leading-relaxed text-cream/75">
            {ADDRESS_LINES.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
            <a href={`tel:${PHONE_TEL}`} className={`mt-3 block ${linkCls}`}>{PHONE_DISPLAY}</a>
          </address>
        </div>
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Opening Hours</h2>
          <p className="mt-4 leading-relaxed text-cream/75">{HOURS}</p>
          <p className="mt-1 text-sm text-cream/50">Closed weekends</p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-site flex flex-col gap-4 py-6 text-sm md:flex-row md:items-center md:justify-between">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <button type="button" className={linkCls} onClick={() => onLegal('privacy')}>Privacy</button>
            <button type="button" className={linkCls} onClick={() => onLegal('terms')}>Terms</button>
            <button type="button" className={linkCls} onClick={openSettings}>Cookie Settings</button>
          </nav>
          <p className="text-cream/45">
            © {new Date().getFullYear()} Esterica Fabrics. <span className="whitespace-nowrap">Website by BOA Network</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
