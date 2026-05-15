import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    // En móvil/touch usamos scroll nativo para evitar desyncs con ScrollTrigger
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches

    if (isTouchDevice) {
      lenisRef.current = null
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    let running = true
    function raf(time) {
      if (!running) return
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      running = false
      lenis.destroy()
    }
  }, [])

  return lenisRef
}

