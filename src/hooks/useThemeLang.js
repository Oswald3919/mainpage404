import { useEffect, useState } from 'react'

function getStored(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = window.localStorage.getItem(key)
    if (saved) return saved
  } catch { /* ignore */ }
  return fallback
}

export function useThemeLang() {
  const [theme, setTheme] = useState(() => getStored('nx404-theme', 'dark'))
  const [lang, setLang] = useState(() => getStored('nx404-lang', 'es'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('nx404-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('nx404-lang', lang)
  }, [lang])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, lang, setLang, toggleTheme }
}
