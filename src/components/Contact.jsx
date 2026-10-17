import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionHeading, Reveal, WhatsAppIcon, PhoneIcon } from './ui'
import { KenteWatermark } from './Kente'
import { FABRICS, PHONE_DISPLAY, PHONE_TEL, whatsappLink } from '../config'

const field = 'field border-cream/35 text-cream placeholder:text-cream/35 focus:border-gold'
const label = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-light/80'

export default function Contact() {
  const [form, setForm] = useState({ name: '', contact: '', fabric: '', metres: '', message: '' })
  const [sent, setSent] = useState(false)
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // No server yet, so the form hands the enquiry to WhatsApp, already written out.
  const submit = (e) => {
    e.preventDefault()
    const lines = [
      'Hi Esterica Fabrics, I have an enquiry from your website.',
      `Name: ${form.name}`,
      `Contact: ${form.contact}`,
      form.fabric && `Fabric: ${form.fabric}`,
      form.metres && `Metres: ${form.metres}`,
      form.message && `Message: ${form.message}`,
    ].filter(Boolean)
    window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <section id="contact" className="section-pad relative overflow-hidden bg-burgundy text-cream">
      <KenteWatermark className="-left-56 bottom-[-120px]" size={640} opacity={0.08} />
      <div className="container-site relative grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Get in touch" title="Make an Enquiry" accent="we reply in person" dark size="sm" className="!mb-3" />
          <p className="mb-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-light [text-wrap:balance]">We reply quickest on WhatsApp during opening hours.</p>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-[17px] leading-relaxed text-cream/75">
              Tell us what you are making and we will help you choose.
            </p>
            <a href={`tel:${PHONE_TEL}`} className="mt-8 inline-flex items-center gap-3 font-serif text-2xl text-cream transition-colors hover:text-gold-light md:text-3xl">
              <PhoneIcon className="h-6 w-6 text-gold" /> {PHONE_DISPLAY}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative lg:col-span-6 lg:col-start-7">
          <form onSubmit={submit} className="relative grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-8">
            <div>
              <label htmlFor="c-name" className={label}>Your name</label>
              <input id="c-name" required autoComplete="name" className={field} value={form.name} onChange={update('name')} />
            </div>
            <div>
              <label htmlFor="c-contact" className={label}>Phone or email</label>
              <input id="c-contact" required autoComplete="email" className={field} value={form.contact} onChange={update('contact')} />
            </div>
            <div>
              <label htmlFor="c-fabric" className={label}>Fabric</label>
              <select id="c-fabric" className={`${field} appearance-none`} value={form.fabric} onChange={update('fabric')}>
                <option value="" className="text-charcoal">Not sure yet</option>
                {FABRICS.map((f) => (
                  <option key={f.name} className="text-charcoal">{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="c-metres" className={label}>Metres needed</label>
              <input id="c-metres" inputMode="decimal" placeholder="6" className={field} value={form.metres} onChange={update('metres')} />
            </div>
            <div className="col-span-2">
              <label htmlFor="c-message" className={label}>Message</label>
              <textarea id="c-message" rows={3} className={`${field} resize-y`} value={form.message} onChange={update('message')} placeholder="Tell us about your project, event or order." />
            </div>
            <div className="col-span-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="accent text-lg text-cream/60">Your enquiry opens in WhatsApp, ready to send.</p>
              <button type="submit" className="btn-gold min-h-[62px] w-full px-10 text-[15px] shadow-[0_18px_36px_-14px_rgba(232,179,26,0.55)] sm:w-auto">
                <WhatsAppIcon /> Send enquiry
              </button>
            </div>
            <AnimatePresence>
              {sent && (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="col-span-2 border-l-2 border-gold pl-4 text-sm text-cream/85"
                >
                  Thank you. Your message is waiting in WhatsApp, just press send and we will be in touch.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
