import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

const REGISTRY_KEY = '__nx404_gsap_plugins_registered__'

if (!globalThis[REGISTRY_KEY]) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
  })
  globalThis[REGISTRY_KEY] = true
}
