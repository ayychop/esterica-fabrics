import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'esterica-cookie-consent'
const ConsentContext = createContext(null)

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function ConsentProvider({ children }) {
  // 'accepted' | 'declined' | null (not chosen yet)
  const [consent, setConsentState] = useState(null)
  const [bannerOpen, setBannerOpen] = useState(false)

  useEffect(() => {
    const stored = read()
    setConsentState(stored)
  }, [])

  const setConsent = (value) => {
    setConsentState(value)
    setBannerOpen(false)
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* storage unavailable, choice lasts for this visit only */
    }
  }

  return (
    <ConsentContext.Provider value={{ consent, setConsent, bannerOpen, openSettings: () => setBannerOpen(true), closeBanner: () => setBannerOpen(false) }}>
      {children}
    </ConsentContext.Provider>
  )
}

export const useConsent = () => useContext(ConsentContext)
