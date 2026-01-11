import { useEffect } from "react"

const useTab = (onCompleted?: () => void) => {
  let newWindow: Window | null = null
  let checkWindowClosed: NodeJS.Timeout | null = null

  const openNewWindow = (url: string) => {
    newWindow = window.open(url, "_blank")

    checkWindowClosed = setInterval(() => {
      if (newWindow?.closed) {
        if (checkWindowClosed) {
          clearInterval(checkWindowClosed)
        }
        newWindow = null
      }
    }, 500)
  }

  useEffect(() => {
    const handleFocus = () => {
      if (newWindow === null) {
        onCompleted && onCompleted()
      }
    }
    // Add focus event listener
    window.addEventListener("focus", handleFocus)

    // Cleanup event listener and interval on unmount
    return () => {
      window.removeEventListener("focus", handleFocus)
      if (checkWindowClosed) clearInterval(checkWindowClosed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { openNewWindow }
}

export default useTab
