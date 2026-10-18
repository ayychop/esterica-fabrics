import { Reveal, TikTokIcon } from './ui'
import { KenteWatermark } from './Kente'
import { TIKTOK_FOLLOWERS, TIKTOK_HANDLE, TIKTOK_URL } from '../config'

// A solid gold block between Our Story and Delivery, pointing to the shop's TikTok.
export default function TikTok() {
  return (
    <section id="tiktok" className="relative overflow-hidden bg-gold py-16 text-ink md:py-20">
      <KenteWatermark className="-left-40 -top-48" size={520} opacity={0.12} color="#0A0A0A" />
      <Reveal className="container-site relative grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <p className="eyebrow text-crimson">On TikTok {TIKTOK_HANDLE}</p>
          <h2 className="font-serif text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.01em]">
            Join {TIKTOK_FOLLOWERS} followers on TikTok
          </h2>
          <p className="accent mt-4 max-w-xl text-[1.35rem] leading-snug text-ink/80 md:text-[1.6rem]">
            See our latest fabrics, styling ideas, and <span className="whitespace-nowrap">behind-the-scenes</span>.
          </p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn min-h-[60px] w-full bg-ink px-8 text-gold shadow-[0_18px_36px_-14px_rgba(10,10,10,0.6)] hover:-translate-y-0.5 hover:bg-charcoal sm:w-auto"
          >
            <TikTokIcon /> Follow us on TikTok
          </a>
        </div>
      </Reveal>
    </section>
  )
}
