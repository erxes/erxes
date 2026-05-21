import { useCallback, useEffect, useState } from "react"

import {
  connectQz,
  findPrinters,
  isQzActive,
  QZ_TRAY_NOT_RUNNING_MESSAGE,
} from "@/lib/qzTray"

export type QzPrintersState = {
  printers: string[]
  loading: boolean
  error: string | null
  connected: boolean
  refresh: () => Promise<void>
}

const useQzPrinters = (enabled: boolean): QzPrintersState => {
  const [printers, setPrinters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await connectQz()
      const list = await findPrinters()
      setPrinters(list)
      setConnected(isQzActive())
    } catch {
      setConnected(false)
      setError(QZ_TRAY_NOT_RUNNING_MESSAGE)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setPrinters([])
      setError(null)
      setConnected(false)
      return
    }
    load()
  }, [enabled, load])

  return { printers, loading, error, connected, refresh: load }
}

export default useQzPrinters
