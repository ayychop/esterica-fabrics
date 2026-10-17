import { useEffect, useState } from 'react'
import { MIN_METRES, STEP, metresLabel, roundToStep } from '../../lib/pricing'

const PRESETS = [1, 2, 3, 5, 10]

// A -/+ stepper in half metres. Typing is allowed; the value settles to the nearest 0.5 on blur.
export function Stepper({ value, onChange, max = 999, label = 'Metres', size = 'md', dark = false }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  const commit = (raw) => {
    const n = parseFloat(raw)
    const next = Number.isFinite(n) ? Math.min(max, roundToStep(n)) : value
    setText(String(next))
    if (next !== value) onChange(next)
  }

  const h = size === 'sm' ? 'h-10' : 'h-12'
  const btn = `grid ${h} w-11 place-items-center text-xl transition-colors disabled:opacity-30 ${dark ? 'hover:bg-cream/10' : 'hover:bg-charcoal/5'}`
  return (
    <div className={`inline-flex items-stretch border ${dark ? 'border-cream/40' : 'border-charcoal/30'}`}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(MIN_METRES, value - STEP))} disabled={value <= MIN_METRES} aria-label={`Remove half a metre, ${label}`}>
        −
      </button>
      <div className={`flex ${h} items-center border-x border-dashed ${dark ? 'border-cream/30' : 'border-charcoal/25'}`}>
        <input
          aria-label={label}
          type="number"
          inputMode="decimal"
          min={MIN_METRES}
          max={max}
          step={STEP}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit(e.currentTarget.value)}
          className="no-spin h-full w-14 bg-transparent text-center text-[17px] font-semibold focus:outline-none"
        />
        <span aria-hidden="true" className="pr-3 text-[15px] opacity-60">m</span>
      </div>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + STEP))} disabled={value >= max} aria-label={`Add half a metre, ${label}`}>
        +
      </button>
    </div>
  )
}

// Presets for the common lengths, or a custom length in half metres.
export default function QuantitySelector({ value, onChange, dark = false }) {
  const [custom, setCustom] = useState(!PRESETS.includes(value))
  const chip = (on) =>
    `min-h-[46px] min-w-[3.5rem] border px-3 text-[15px] font-semibold transition-colors ${
      dark
        ? on ? 'border-gold bg-gold text-ink' : 'border-cream/30 text-cream hover:border-cream'
        : on ? 'border-charcoal bg-charcoal text-gold' : 'border-charcoal/25 text-charcoal hover:border-charcoal'
    }`

  return (
    <fieldset>
      <legend className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${dark ? 'text-cream/70' : 'text-charcoal/70'}`}>How many metres?</legend>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={!custom && value === m}
            className={chip(!custom && value === m)}
            onClick={() => {
              setCustom(false)
              onChange(m)
            }}
          >
            {metresLabel(m)}
          </button>
        ))}
        <button type="button" aria-pressed={custom} className={chip(custom)} onClick={() => setCustom(true)}>
          Custom
        </button>
      </div>
      {custom && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Stepper value={value} onChange={onChange} label="Custom metres" dark={dark} />
          <p className={`text-[13px] ${dark ? 'text-cream/60' : 'text-charcoal/60'}`}>In half metre steps</p>
        </div>
      )}
    </fieldset>
  )
}
