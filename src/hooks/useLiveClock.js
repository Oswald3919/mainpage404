import { useEffect, useState } from 'react'

export function useLiveClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString())

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
