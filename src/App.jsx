import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './gsap/setup'
import './App.css'
import { i18n } from './data/i18n'
import { useLenis } from './hooks/useLenis'
import { useThemeLang } from './hooks/useThemeLang'
import { useLiveClock } from './hooks/useLiveClock'


function WaveText({ text, highlights = [] }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, wi) => {
        const isHl = highlights.some(
          (h) => h.toUpperCase() === word.toUpperCase()
        )
        return (
          <span key={wi} className={`wave-word${isHl ? ' wave-word--hl' : ''}`}>
            {word.split('').map((c, ci) => (
              <span key={ci} className="cmd-letter" data-wave-letter>
                {c}
              </span>
            ))}
            {wi < words.length - 1 && (
              <span className="cmd-letter is-space" data-wave-letter>&nbsp;</span>
            )}
          </span>
        )
      })}
    </>
  )
}

function HighlightText({ text }) {
  if (!text || !text.includes('**')) return <>{text}</>
  const parts = text.split('**')
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <mark key={i} className="hl">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

export default function App() {
  const rootRef = useRef(null)
  const { theme, lang, setLang, toggleTheme } = useThemeLang()
  const [isLocked, setIsLocked] = useState(false)
  const lenisRef = useLenis()
  const clock = useLiveClock()
  const t = i18n[lang]

  // 1. Entry + Bubbles — runs once on mount
  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.4 } })
    tl.fromTo('[data-chrome]', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.1)
    tl.fromTo('[data-address]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.4)
    tl.fromTo('[data-error-code]', { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, 0.5)
    const heroLetters = root.querySelectorAll('.cmd-hero [data-wave-letter]')
    tl.fromTo(heroLetters, { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.02 }, 0.6)

    root.querySelectorAll('[data-bubble]').forEach((b, i) => {
      gsap.to(b, {
        x: gsap.utils.random(-60, 60),
        y: gsap.utils.random(-40, 40),
        duration: 7 + i,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })
  }, { scope: rootRef })

  // 2. Glitch loop — re-runs when lang changes (letters re-render)
  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const allLetters = root.querySelectorAll('[data-wave-letter]')
    if (!allLetters.length) return

    gsap.set(allLetters, { x: 0, skewX: 0, opacity: 1 })

    let timer = null
    const glitchLoop = () => {
      const targets = gsap.utils.shuffle([...allLetters]).slice(0, 3)
      gsap.to(targets, {
        x: () => gsap.utils.random(-4, 4),
        skewX: () => gsap.utils.random(-15, 15),
        opacity: () => gsap.utils.random(0.5, 1),
        duration: 0.1,
        repeat: 1,
        yoyo: true,
        ease: 'power4.inOut',
        onComplete: () => {
          timer = gsap.delayedCall(gsap.utils.random(0.1, 0.8), glitchLoop)
        },
      })
    }
    glitchLoop()

    return () => {
      if (timer) timer.kill()
      gsap.killTweensOf(allLetters)
    }
  }, { scope: rootRef, dependencies: [lang] })

  // 3. ScrollTrigger reveals - re-run when lang changes
  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    root.querySelectorAll('[data-reveal]').forEach((section) => {
      const headerItems = Array.from(section.children).filter(
        (node) => !node.matches('.signal-strip, .flow-list, .focus-grid')
      )
      const rowItems = Array.from(
        section.querySelectorAll('.signal-item, .flow-row, .focus-item')
      )
      const targets = [...new Set([...headerItems, ...rowItems])]

      gsap.from(targets, {
        y: 18,
        autoAlpha: 0.92,
        duration: 0.42,
        stagger: 0.045,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 96%',
          once: true,
          fastScrollEnd: true,
        },
      })
    })

    // Refresh after render/layout changes, especially on touch viewport shifts.
    const id = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => clearTimeout(id)
  }, { scope: rootRef, dependencies: [lang] })

  // 4. Portal reveal + magnetic button — runs once
  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const portal = root.querySelector('[data-portal]')
    if (!portal) return

    gsap.fromTo(
      portal.querySelector('.portal-h2'),
      { scale: 0.9, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1.5,
        scrollTrigger: {
          trigger: portal,
          start: 'top 95%',
          once: true,
        },
      }
    )

    const pBtn = portal.querySelector('.portal-btn')
    if (!pBtn) return

    const moveBtn = (e) => {
      const rect = pBtn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(pBtn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' })
    }
    pBtn.addEventListener('mousemove', moveBtn)
    pBtn.addEventListener('mouseleave', () =>
      gsap.to(pBtn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    )
  }, { scope: rootRef })

  const toggleLang = () => {
    if (isLocked) return
    setIsLocked(true)
    setLang((prev) => (prev === 'es' ? 'en' : 'es'))
    setTimeout(() => setIsLocked(false), 700)
  }

  const handleExploreClick = () => {
    const firstContent = rootRef.current?.querySelector('#first-content')
    if (!firstContent) return

    if (lenisRef.current) {
      lenisRef.current.scrollTo(firstContent, { duration: 0.75, offset: -10 })
      return
    }

    firstContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handlePortalClick = (e) => {
    e.preventDefault()
    window.open('https://alphamx.vercel.app', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="shell" ref={rootRef}>
      {/* ── HERO ── */}
      <section className="cmd-hero" data-hero>
        <div className="cmd-bubbles" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`cmd-bubble b${i}`} data-bubble />
          ))}
        </div>

        <div className="hero-browser">
          {/* Chrome bar */}
          <div className="browser-chrome" data-chrome>
            <div className="chrome-left">
              <div className="browser-dots" aria-hidden="true">
                <span className="dot-close" />
                <span className="dot-minimize" />
                <span className="dot-expand" />
              </div>
              <div className="browser-tabs">
                <div className="browser-tab"><p>{t.home}</p></div>
                <div className="browser-tab is-active">
                  <span className="tab-icon" aria-hidden="true">×</span>
                  <p>{t.notFound}</p>
                </div>
                <div className="browser-tab"><p>{t.services}</p></div>
              </div>
            </div>
            <div className="chrome-right">
              <span className="brand-mark">ALPHA</span>
              <div className="chrome-controls">
                <button
                  id="lang-toggle"
                  onClick={toggleLang}
                  className="lang-toggle"
                  aria-label="Cambiar idioma"
                >
                  {lang.toUpperCase()}
                </button>
                <button
                  id="theme-toggle"
                  onClick={toggleTheme}
                  className="theme-toggle"
                  aria-label="Cambiar tema"
                >
                  {theme === 'dark' ? '☀' : '◗'}
                </button>
              </div>
            </div>
          </div>

          {/* Address bar */}
          <div className="browser-address" data-address>
            <div className="address-bar">
              <span className="address-status">{t.status}</span>
              <p>alpha.mx/404-error</p>
            </div>
          </div>

          {/* Body */}
          <div className="browser-body">
            <div className="browser-content">
              <p className="error-code" data-error-code>404</p>
              <h1 className="cmd-h1">
                <WaveText text="PAGE NOT FOUND" />
              </h1>
              <p className="cmd-sub"><HighlightText text={t.errorSub} /></p>
              <p className="cmd-small"><HighlightText text={t.errorSmall} /></p>
              <div className="cmd-actions">
                <button
                  id="explore-btn"
                  className="cmd-btn"
                  onClick={handleExploreClick}
                >
                  {t.explore}
                </button>
              </div>
            </div>

            <aside className="tech-panel" aria-label="Panel técnico">
              <div className="tech-header">
                <span className="tech-title">{t.techTitle}</span>
                <span className="tech-live-tag">LIVE_MONITOR</span>
              </div>
              <div className="tech-body">
                <div className="tech-row">
                  <span className="tech-key">SYS_STATUS:</span>
                  <span className="tech-val status-err">{t.techStatus}</span>
                </div>
                <div className="tech-row">
                  <span className="tech-key">NODE_SOURCE:</span>
                  <span className="tech-val">{t.techSource}</span>
                </div>
                <div className="tech-row">
                  <span className="tech-key">EXEC_SCRIPT:</span>
                  <span className="tech-val">{t.techSolution}</span>
                </div>

                <div className="tech-divider" />

                <div className="tech-row">
                  <span className="tech-key">IG_SOCKET_SYNC:</span>
                  <a href="https://instagram.com/alpha" target="_blank" rel="noreferrer" className="tech-link">
                    0xAF_ALPHA_DIGITAL
                  </a>
                </div>
                <div className="tech-row">
                  <span className="tech-key">WA_P2P_HANDSHAKE:</span>
                  <a href="https://wa.me/521234567890" target="_blank" rel="noreferrer" className="tech-link">
                    PORT_52_234_567
                  </a>
                </div>
                <div className="tech-row">
                  <span className="tech-key">SMTP_TLS_RELAY:</span>
                  <a href="mailto:hello@alpha.mx" className="tech-link">HELLO@ALPHA.MX</a>
                </div>

                <div className="tech-divider" />

                <div className="tech-footer-log">
                  <span className="log-timestamp">[{clock}]</span>
                  <span className="log-msg">WAITING_FOR_UPLINK...</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="main" id="main">
        {/* Direction */}
        <section className="story" id="first-content" data-reveal>
          <p className="eyebrow">{t.dirTitle}</p>
          <h2><HighlightText text={t.dirH2} /></h2>
          <p className="lead"><HighlightText text={t.dirLead} /></p>
          <div className="signal-strip">
            {t.dirItems.map((item, i) => (
              <p key={i} className="signal-item">
                <span>0{i + 1}</span> <HighlightText text={item} />
              </p>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="flow" data-reveal>
          <p className="eyebrow">{t.procTitle}</p>
          <h2><HighlightText text={t.procH2} /></h2>
          <p className="lead"><HighlightText text={t.procLead} /></p>
          <div className="flow-list">
            {t.procSteps.map((step, i) => (
              <article key={i} className="flow-row">
                <span className="flow-index">0{i + 1}</span>
                <div>
                  <h3>{step.h}</h3>
                  <p><HighlightText text={step.p} /></p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Focus */}
        <section className="focus" data-reveal>
          <p className="eyebrow">{t.focusTitle}</p>
          <h2><HighlightText text={t.focusH2} /></h2>
          <p className="lead"><HighlightText text={t.focusLead} /></p>
          <div className="focus-grid">
            {t.focusItems.map((item, i) => (
              <div key={i} className="focus-item">
                <h3>{item.h}</h3>
                <p><HighlightText text={item.p} /></p>
              </div>
            ))}
          </div>
        </section>

        {/* Portal CTA */}
        <section className="portal-section" data-portal>
          <div className="portal-grid" aria-hidden="true" />
          <div className="portal-content">
            <h2 className="portal-h2">
              <WaveText text={t.portalH2} highlights={t.portalHighlights} />
            </h2>
            <div className="portal-actions">
              <button id="portal-btn" onClick={handlePortalClick} className="portal-btn">
                <span className="portal-btn-text">{t.portalBtn}</span>
                <span className="portal-btn-effect" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p className="footer-text">{t.footer}</p>
        </footer>
      </main>
    </div>
  )
}
