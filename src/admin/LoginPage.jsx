import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import { KenteStrip } from '../components/Kente'
import { ArrowIcon } from '../components/ui'
import { supabase, supabaseConfigError } from '../supabaseClient'
import { useRouter } from '../lib/router'

const EASE = [0.22, 1, 0.36, 1]
const label = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-cream/60 transition-colors duration-300 group-focus-within:text-gold'
const input = 'field border-cream/30 text-cream placeholder:text-cream/30'

export default function LoginPage({ auth }) {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(supabaseConfigError)

  // Already signed in as an admin: straight to the dashboard.
  useEffect(() => {
    if (auth.status === 'admin') navigate('/admin', { replace: true })
  }, [auth.status])

  const submit = async (e) => {
    e.preventDefault()
    if (supabaseConfigError) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setError(error.message === 'Invalid login credentials' ? 'That email and password do not match an account.' : error.message)
  }

  const notAdmin = auth.status === 'not-admin'

  return (
    <div className="relative flex min-h-screen flex-col bg-ink text-cream">
      <KenteStrip height={14} />
      <main className="grid flex-1 place-items-center px-5 py-16">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Logo className="h-9 w-auto" />
          <p className="mt-12 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Owner's portal</p>
          <h1 className="mt-3 font-serif text-[clamp(2.6rem,7vw,3.4rem)] font-semibold leading-[0.95]">Sign in</h1>

          {notAdmin ? (
            <div className="mt-10 border-l-2 border-crimson bg-crimson/20 px-4 py-4 text-[14px] leading-snug">
              <p>{auth.session.user.email} is signed in, but is not listed as an admin.</p>
              <button type="button" onClick={() => supabase.auth.signOut()} className="mt-3 text-[12px] font-bold uppercase tracking-[0.18em] text-gold hover:text-gold-light">
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 grid gap-8">
              <div className="group">
                <label htmlFor="admin-email" className={label}>Email</label>
                <input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
              </div>
              <div className="group">
                <label htmlFor="admin-password" className={label}>Password</label>
                <input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
              </div>
              {error && (
                <p role="alert" className="border-l-2 border-crimson bg-crimson/20 px-4 py-3 text-[13px] leading-snug">{error}</p>
              )}
              <button type="submit" disabled={busy || Boolean(supabaseConfigError)} className="btn-gold min-h-[60px] w-full text-[15px] disabled:cursor-wait disabled:opacity-60">
                {busy ? 'Signing in' : 'Sign in'} {!busy && <ArrowIcon />}
              </button>
            </form>
          )}

          <a href="/" className="mt-10 inline-block text-[12px] font-semibold uppercase tracking-[0.2em] text-cream/50 transition-colors hover:text-gold">
            Back to the shop
          </a>
        </motion.div>
      </main>
    </div>
  )
}
