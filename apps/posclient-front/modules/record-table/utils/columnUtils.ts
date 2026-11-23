import { Column } from "@tanstack/react-table"

export const STRUCTURAL_COLUMN_IDS = ["more", "checkbox"]

export const isStructuralColumn = (columnId: string) =>
  STRUCTURAL_COLUMN_IDS.includes(columnId)

export const isFixedWidthColumn = <TData, TValue>(
  column: Column<TData, TValue>
) =>
  column.columnDef.enableResizing === false ||
  isStructuralColumn(column.id) ||
  !!column.getIsPinned()

export const arrayMove = <T>(items: T[], from: number, to: number): T[] => {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
