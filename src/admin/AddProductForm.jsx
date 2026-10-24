import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { KenteStrip } from '../components/Kente'
import { supabase } from '../supabaseClient'
import { CATEGORY_TONE, toProduct } from '../data/products'
import { TIERS, perMetreLabel } from '../lib/pricing'

const EASE = [0.22, 1, 0.36, 1]
const BUCKET = 'product-images'
const label = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-cream/60 transition-colors duration-300 group-focus-within:text-gold'
const input = 'field border-cream/30 text-cream placeholder:text-cream/30'
const EMPTY = { name: '', price: '', category: 'standard', stock: '' }

// "Royal Gold" becomes royal-gold, the shape /shop/<slug> accepts.
const slugify = (name) =>
  name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'fabric'

function uniqueSlug(name, taken) {
  const base = slugify(name)
  let slug = base
  for (let n = 2; taken.includes(slug); n++) slug = `${base}-${n}`
  return slug
}

// A drawer from the right: name, price, category, stock and a photograph, saved to Storage and then `products`.
export default function AddProductForm({ open, onClose, onAdded, taken }) {
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const first = useRef(null)
  // Read by the Escape handler, which is set up once per opening.
  const busyRef = useRef(null)
  busyRef.current = busy
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setFile(null)
    setError(null)
    const t = setTimeout(() => first.current?.focus(), 250)
    const onKey = (e) => e.key === 'Escape' && !busyRef.current && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pence = Math.round(Number(form.price) * 100)

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Choose a photograph of the cloth.')
    if (!file.type.startsWith('image/')) return setError('The photograph must be an image file.')
    setError(null)
    const slug = uniqueSlug(form.name.trim(), taken)
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${slug}-${Date.now()}.${ext}`

    setBusy('Uploading photograph')
    const upload = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
    if (upload.error) {
      setBusy(null)
      return setError(`Could not upload the photograph: ${upload.error.message}`)
    }
    const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path).data

    setBusy('Saving product')
    const { data, error } = await supabase
      .from('products')
      .insert({
        slug,
        name: form.name.trim(),
        price: pence,
        category: form.category,
        stock: Math.round(Number(form.stock) * 10) / 10,
        image_url: publicUrl,
        tone: CATEGORY_TONE[form.category],
      })
      .select()
      .single()
    setBusy(null)
    if (error) {
      // Leave no orphan photograph behind when the row could not be saved.
      await supabase.storage.from(BUCKET).remove([path])
      return setError(error.code === '23505' ? 'A product with this name already exists. Try a different name.' : `Could not save the product: ${error.message}`)
    }
    onAdded(toProduct(data))
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/80"
            onClick={() => !busy && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-y-auto border-l border-cream/10 bg-charcoal text-cream"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <KenteStrip height={10} className="shrink-0" />
            <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-8 md:px-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Inventory</p>
                <h2 id="add-title" className="mt-2 font-serif text-[2.4rem] font-semibold leading-none">Add product</h2>
              </div>
              <button type="button" onClick={onClose} disabled={Boolean(busy)} aria-label="Close" className="grid h-11 w-11 place-items-center border border-cream/25 text-[22px] leading-none transition-colors hover:border-gold hover:text-gold">
                ×
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-8 px-6 pb-10 pt-8 md:px-10">
              <div className="group">
                <label htmlFor="np-name" className={label}>Name</label>
                <input ref={first} id="np-name" required maxLength={80} value={form.name} onChange={update('name')} placeholder="Royal Gold" className={input} />
                {form.name.trim() && <p className="mt-2 text-[12px] text-cream/45">Shop address: /shop/{uniqueSlug(form.name.trim(), taken)}</p>}
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="group">
                  <label htmlFor="np-price" className={label}>Price per metre (£)</label>
                  <input id="np-price" type="number" inputMode="decimal" required min="0.01" step="0.01" value={form.price} onChange={update('price')} placeholder={String(TIERS[form.category].perMetre / 100)} className={`${input} no-spin`} />
                </div>
                <div className="group">
                  <label htmlFor="np-stock" className={label}>Stock (metres)</label>
                  <input id="np-stock" type="number" inputMode="decimal" required min="0" step="0.1" value={form.stock} onChange={update('stock')} placeholder="25" className={`${input} no-spin`} />
                </div>
              </div>

              <div className="group">
                <label htmlFor="np-category" className={label}>Category</label>
                <select id="np-category" value={form.category} onChange={update('category')} className={`${input} cursor-pointer appearance-none [&>option]:text-ink`}>
                  {Object.entries(TIERS).map(([k, t]) => (
                    <option key={k} value={k}>{t.label} (usually {perMetreLabel(t.perMetre)}/m)</option>
                  ))}
                </select>
              </div>

              <div>
                <span className={label}>Photograph</span>
                <label
                  htmlFor="np-image"
                  className="mt-3 grid cursor-pointer place-items-center overflow-hidden border border-dashed border-cream/30 bg-ink/40 transition-colors hover:border-gold has-[:focus-visible]:border-gold"
                >
                  {preview ? (
                    <img src={preview} alt="Chosen photograph" className="aspect-[4/5] w-full object-cover" />
                  ) : (
                    <span className="grid aspect-[4/3] w-full place-items-center px-6 text-center text-[14px] text-cream/60">
                      <span>
                        <span className="block text-[12px] font-bold uppercase tracking-[0.2em] text-gold">Choose a photograph</span>
                        <span className="mt-2 block">JPG, PNG or WebP. Portrait shots look best in the shop.</span>
                      </span>
                    </span>
                  )}
                  <input id="np-image" type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="sr-only" />
                </label>
                {file && (
                  <p className="mt-2 flex justify-between gap-4 text-[12px] text-cream/50">
                    <span className="truncate">{file.name}</span>
                    <label htmlFor="np-image" className="shrink-0 cursor-pointer font-bold uppercase tracking-[0.16em] text-gold">Change</label>
                  </p>
                )}
              </div>

              {error && <p role="alert" className="border-l-2 border-crimson bg-crimson/20 px-4 py-3 text-[13px] leading-snug">{error}</p>}

              <motion.button
                type="submit"
                disabled={Boolean(busy)}
                className="btn-gold min-h-[60px] w-full text-[15px] disabled:cursor-wait disabled:opacity-70"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
              >
                {busy ?? 'Add to the shop'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
