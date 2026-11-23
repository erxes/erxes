import { Table } from "@tanstack/react-table"

export interface IRecordTableContext {
  table: Table<unknown>
  columnSelectorOpen: boolean
  setColumnSelectorOpen: (open: boolean) => void
  draggingColumnId: string | null
  setDraggingColumnId: (id: string | null) => void
  overColumnId: string | null
  setOverColumnId: (id: string | null) => void
  moveColumn: (activeId: string, overId: string) => void
  setAvailableWidth: (width: number) => void
}
