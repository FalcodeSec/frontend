import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      // Updated threshold to 1024px to match lg: breakpoint
      // This ensures mobile behavior on tablets and smaller screens
      setIsMobile(window.innerWidth < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return isMobile
}
