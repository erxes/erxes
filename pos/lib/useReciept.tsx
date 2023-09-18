import { useEffect, useRef } from "react"

const useReciept = (options?: { onCompleted?: () => void }) => {
  const { onCompleted } = options || {}
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const handleIframeMessage = (event: MessageEvent) => {
    if (
      event.source === iframeRef.current?.contentWindow &&
      event.data?.message === "close"
    ) {
      onCompleted && onCompleted()
    }
  }

  useEffect(() => {
    // Add event listener to listen for messages from the iframe
    window.addEventListener("message", handleIframeMessage)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleIframeMessage)
    }
  }, [])

  return { iframeRef }
}

export default useReciept
