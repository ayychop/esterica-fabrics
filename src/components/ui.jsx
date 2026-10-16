import { motion } from 'framer-motion'

// Standard 1 and 18: Framer Motion whileInView uses IntersectionObserver; once: true means it never re-triggers.
export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

export function Photo({ src, srcSet, sizes, alt, className = '', imgClassName = '', loading = 'lazy', ...rest }) {
  return (
    <div className={`photo ${className}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`h-full w-full object-cover ${imgClassName}`}
        {...rest}
      />
    </div>
  )
}

// Editorial heading: always left aligned, a big serif title with a delicate italic aside.
export function SectionHeading({ eyebrow, title, accent, intro, dark = false, tone, size = 'lg', className = '' }) {
  if (tone === 'gold') {
    return (
      <Reveal className={`mb-12 max-w-3xl md:mb-16 ${className}`}>
        {eyebrow && <p className="eyebrow text-ink">{eyebrow}</p>}
        <h2 className={`font-serif ${size === 'sm' ? 'text-[clamp(2.6rem,4.4vw,3.9rem)]' : 'text-[clamp(2.6rem,6vw,4.75rem)]'} font-semibold leading-[0.98] tracking-[-0.01em] text-ink [text-shadow:0_1px_0_rgba(255,240,180,0.6),0_10px_24px_rgba(120,70,0,0.25)]`}>
          {title}
          {accent && <span className="accent mt-1 block pl-[0.5em] text-[0.82em] font-medium text-crimson [text-shadow:none]">{accent}</span>}
        </h2>
        {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">{intro}</p>}
      </Reveal>
    )
  }
  return (
    <Reveal className={`mb-12 max-w-3xl md:mb-16 ${className}`}>
      {eyebrow && <p className={`eyebrow ${dark ? 'text-gold' : 'text-gold-dark'}`}>{eyebrow}</p>}
      <h2
        className={`font-serif ${size === 'sm' ? 'text-[clamp(2.2rem,4.4vw,3.9rem)]' : 'text-[clamp(2.4rem,6vw,4.75rem)]'} font-semibold leading-[0.98] tracking-[-0.01em] ${
          dark ? 'heading-depth-dark text-cream' : 'heading-depth text-charcoal'
        }`}
      >
        {title}
        {accent && <span className={`accent mt-1 block pl-[0.5em] text-[0.82em] font-normal ${dark ? 'text-gold-light' : 'text-crimson'}`}>{accent}</span>}
      </h2>
      {intro && <p className={`mt-6 max-w-xl text-lg leading-relaxed ${dark ? 'text-cream/75' : 'text-charcoal/70'}`}>{intro}</p>}
    </Reveal>
  )
}

export const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.77a9.36 9.36 0 0 1 2.76 6.66c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.66L.62 23.62l6.02-1.58a11.3 11.3 0 0 0 5.4 1.38h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.31-8.01z" />
  </svg>
)

export const PhoneIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
)

export const PinIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
)

export const ArrowIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const BagIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" strokeLinecap="round" />
  </svg>
)

export const CheckIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export const TruckIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
)
