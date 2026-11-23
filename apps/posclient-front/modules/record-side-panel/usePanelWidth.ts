import { useState } from "react"

import { SIDE_PANEL_WIDTH } from "./RecordSidePanel"

export const usePanelWidth = (storageKey: string) => {
  const [width, setWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey))
      return saved > 0 ? saved : SIDE_PANEL_WIDTH.default
    } catch {
      return SIDE_PANEL_WIDTH.default
    }
  })

  const saveWidth = (next: number) => {
    setWidth(next)
    try {
      localStorage.setItem(storageKey, String(next))
    } catch {
    }
  }

  return [width, saveWidth] as const
}
