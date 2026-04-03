import React from "react"

const useKeyEvent = (callBack: () => void, key: string) => {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (key === e.key) {
        e.preventDefault()
        callBack()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [callBack, key])

  return {}
}

export default useKeyEvent
