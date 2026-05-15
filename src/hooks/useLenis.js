import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Keep native scroll on touch devices to avoid long-page desync issues.
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    if (isTouchDevice) {
      lenisRef.current = null
      return
    }

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    lenisRef.current = lenis

    const unsubscribeScroll = lenis.on('scroll', ScrollTrigger.update)

    let running = true
    function raf(time) {
      if (!running) return
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      running = false
      unsubscribeScroll()
      lenis.destroy()
    }
  }, [])

  return lenisRef
}
