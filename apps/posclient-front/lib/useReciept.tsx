import { useEffect, useRef } from "react"

const useReciept = (options?: { onCompleted?: () => void }) => {
  const { onCompleted } = options || {}
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onCompletedRef = useRef(onCompleted)

  useEffect(() => {
    onCompletedRef.current = onCompleted
  }, [onCompleted])

  const handleIframeMessage = (event: MessageEvent) => {
    if (
      event.source === iframeRef.current?.contentWindow &&
      event.data?.message === "close" &&
      onCompletedRef.current
    ) {
      onCompletedRef.current()
    }
  }

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage)

    return () => {
      window.removeEventListener("message", handleIframeMessage)
    }
  }, [])

  return { iframeRef }
}

export default useReciept
