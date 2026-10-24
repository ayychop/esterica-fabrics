import { useEffect, useState } from 'react'
import { supabase, supabaseConfigError } from '../supabaseClient'
import { useRouter } from '../lib/router'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'

// Who is signed in, and whether admin_users lists them. The database enforces the same rule
// through Row Level Security, so this only decides what to draw.
function useAdminAuth() {
  const [auth, setAuth] = useState({ status: supabaseConfigError ? 'unconfigured' : 'checking', session: null })

  useEffect(() => {
    if (supabaseConfigError) return
    let live = true
    const check = async (session) => {
      if (!session) return live && setAuth({ status: 'signed-out', session: null })
      const { data, error } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (!live) return
      if (error) return setAuth({ status: 'error', session, error: error.message })
      setAuth({ status: data ? 'admin' : 'not-admin', session })
    }
    // Supabase asks that no other Supabase call is awaited inside this callback, hence the timeout.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => check(session), 0)
    })
    return () => {
      live = false
      data.subscription.unsubscribe()
    }
  }, [])

  return auth
}

export function AdminScreen({ children }) {
  return <div className="grid min-h-screen place-items-center bg-ink px-5 text-center text-cream">{children}</div>
}

// The protected wrapper: without an admin session, /admin sends you to /admin/login.
function RequireAdmin({ auth, children }) {
  const { navigate } = useRouter()
  useEffect(() => {
    if (auth.status === 'signed-out') navigate('/admin/login', { replace: true })
  }, [auth.status])

  if (auth.status === 'admin') return children
  if (auth.status === 'not-admin') {
    return (
      <AdminScreen>
        <div className="max-w-md">
          <p className="font-serif text-[2rem] font-semibold leading-tight">No admin access</p>
          <p className="mt-3 text-[14px] text-cream/70">{auth.session.user.email} is signed in, but is not listed as an admin for Esterica Fabrics.</p>
          <button type="button" onClick={() => supabase.auth.signOut()} className="btn-gold mt-8">Sign out</button>
        </div>
      </AdminScreen>
    )
  }
  if (auth.status === 'error' || auth.status === 'unconfigured') {
    return (
      <AdminScreen>
        <p className="max-w-md break-words text-[14px] text-cream/80">{auth.error ?? supabaseConfigError}</p>
      </AdminScreen>
    )
  }
  return (
    <AdminScreen>
      <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-gold">Checking your session</p>
    </AdminScreen>
  )
}

export default function AdminApp({ route }) {
  const auth = useAdminAuth()

  useEffect(() => {
    document.title = 'Admin | Esterica Fabrics'
    // Keep the portal out of search results.
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  if (route.name === 'admin-login') return <LoginPage auth={auth} />
  return (
    <RequireAdmin auth={auth}>
      <Dashboard user={auth.session?.user} />
    </RequireAdmin>
  )
}
