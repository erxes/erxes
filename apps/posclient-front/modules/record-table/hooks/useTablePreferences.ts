import { useCallback, useState } from "react"
import type { ColumnPinningState } from "@tanstack/react-table"

export interface TablePrefs {
  columnOrder?: string[]
  columnPinning?: ColumnPinningState
  columnSizing?: Record<string, number>
  columnVisibility?: Record<string, boolean>
}

const storageKey = (tableId: string) => `erxes_table_prefs_${tableId}`

export const useTablePreferences = (tableId: string | undefined) => {
  const fetchStorage = (): TablePrefs => {
    if (!tableId) return {}
    try {
      const prefs = localStorage.getItem(storageKey(tableId))
      return prefs ? (JSON.parse(prefs) as TablePrefs) : {}
    } catch {
      return {}
    }
  }

  const [prefs, setPrefs] = useState<TablePrefs>(fetchStorage)

  const savePrefs = useCallback(
    (updates: Partial<TablePrefs>) => {
      if (!tableId) return
      setPrefs((currentPrefs) => {
        const merged = { ...currentPrefs, ...updates }
        try {
          localStorage.setItem(storageKey(tableId), JSON.stringify(merged))
        } catch {
        }
        return merged
      })
    },
    [tableId]
  )

  return { prefs, savePrefs }
}
