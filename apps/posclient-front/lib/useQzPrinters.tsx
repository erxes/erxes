import { useCallback, useEffect, useRef, useState } from "react"

import {
  connectQz,
  findPrinters,
  isQzActive,
  QZ_TRAY_NOT_RUNNING_MESSAGE,
} from "@/lib/qzTray"

export interface IQzPrintersState {
  printers: string[]
  loading: boolean
  error: string | null
  connected: boolean
  refresh: () => Promise<void>
}

const useQzPrinters = (enabled: boolean): IQzPrintersState => {
  const [printers, setPrinters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const mountedRef = useRef(true)
  const requestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
    }
  }, [])

  const canUpdate = useCallback((requestId: number) => {
    return mountedRef.current && requestIdRef.current === requestId
  }, [])

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setLoading(true)
    setError(null)

    try {
      await connectQz()
      const list = await findPrinters()

      if (!canUpdate(requestId)) return

      setPrinters(list)
      setConnected(isQzActive())
    } catch {
      if (!canUpdate(requestId)) return

      setConnected(false)
      setError(QZ_TRAY_NOT_RUNNING_MESSAGE)
    } finally {
      if (canUpdate(requestId)) {
        setLoading(false)
      }
    }
  }, [canUpdate])

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1
      setPrinters([])
      setError(null)
      setConnected(false)
      setLoading(false)
      return
    }

    load()
  }, [enabled, load])

  return { printers, loading, error, connected, refresh: load }
}

export default useQzPrinters
