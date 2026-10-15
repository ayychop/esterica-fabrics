import Logo, { LogoMark } from './Logo'

// One entry point for the brand mark, built on the vector paths in logoPaths.js.
// variant "mark": the calligraphic E alone. "inline": E beside ESTERICA. "stacked": E above ESTERICA.
export default function EstericaLogo({ variant = 'inline', ...props }) {
  if (variant === 'mark') return <LogoMark {...props} />
  return <Logo layout={variant} {...props} />
}
