import { useEffect } from 'react'
import PageIntro from '../components/shop/PageIntro'
import { ArrowIcon } from '../components/ui'
import { Link } from '../lib/router'

export default function NotFoundPage({ title = 'Page not found' }) {
  useEffect(() => {
    document.title = `${title} | Esterica Fabrics`
  }, [title])
  return (
    <PageIntro eyebrow="Lost thread" title={title} accent="this cloth has been cut">
      <div className="mt-10 flex flex-col gap-3 pb-10 sm:flex-row">
        <Link to="/shop" className="btn-gold">Browse the shop <ArrowIcon /></Link>
        <Link to="/" className="btn-outline-light">Back to home</Link>
      </div>
    </PageIntro>
  )
}
