import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Keep native scroll on mobile/tablet touch to avoid nested-scroll/trap behavior.
    const isTouchLike = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches
    const hasTouchPoints = navigator.maxTouchPoints > 0
    if (isTouchLike || (isSmallScreen && hasTouchPoints)) {
      lenisRef.current = null
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      autoRaf: false,
    })
    lenisRef.current = lenis

    const unsubscribeScroll = lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      unsubscribeScroll()
      lenis.destroy()
    }
  }, [])

  return lenisRef
}
