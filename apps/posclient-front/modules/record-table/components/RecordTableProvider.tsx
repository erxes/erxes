"use client"

import {
  createContext,
  HTMLAttributes,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  getCoreRowModel,
  Table,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { useTablePreferences } from "../hooks/useTablePreferences"
import { IRecordTableContext } from "../types/recordTableTypes"
import { arrayMove, isStructuralColumn } from "../utils/columnUtils"
import { RecordTableContainer } from "./RecordTableContainer"

const RecordTableContext = createContext<IRecordTableContext | null>(null)

export function useRecordTable() {
  const context = useContext(RecordTableContext)
  if (!context) {
    throw new Error("useRecordTable must be used within a RecordTableProvider.")
  }
  return context
}

export interface RecordTableProviderProps<
  TData extends { _id: string },
> extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  stickyColumns?: string[]
  tableId?: string
  ref?: React.Ref<HTMLDivElement>
}

const withStructuralPinned = (
  pinning: ColumnPinningState,
  columnIds: string[]
): ColumnPinningState => {
  const left = pinning.left ?? []
  const structural = columnIds.filter(
    (id) => isStructuralColumn(id) && !left.includes(id)
  )
  if (!left.length || !structural.length) return pinning
  return { ...pinning, left: [...structural, ...left] }
}

export const RecordTableProvider = <TData extends { _id: string }>({
  children,
  columns,
  data,
  className,
  stickyColumns,
  tableId,
  ref,
  ...restProps
}: RecordTableProviderProps<TData>) => {
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [availableWidth, setAvailableWidth] = useState(0)
  const {
    prefs: { columnOrder, columnPinning, columnSizing, columnVisibility },
    savePrefs,
  } = useTablePreferences(tableId)

  const columnIds = columns.map((column) => column.id || "")

  const [colOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    const known = (columnOrder || []).filter((id) => columnIds.includes(id))
    return [...known, ...columnIds.filter((id) => !known.includes(id))]
  })
  const [colVisibility, setColVisibility] = useState<VisibilityState>(
    columnVisibility || {}
  )
  const [colSizing, setColSizing] = useState<ColumnSizingState>(
    columnSizing || {}
  )
  const [colPinning, setColPinning] = useState<ColumnPinningState>(
    () => columnPinning || { left: stickyColumns ?? [] }
  )

  const table = useReactTable<TData>({
    data,
    columns,
    defaultColumn: {
      maxSize: 800,
    },
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder: colOrder,
      columnSizing: colSizing,
      columnVisibility: colVisibility,
      columnPinning: withStructuralPinned(colPinning, columnIds),
    },
    columnResizeMode: "onChange",
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColSizing,
    onColumnVisibilityChange: setColVisibility,
    onColumnPinningChange: setColPinning,
    getRowId: (row) => row._id,
  })

  useEffect(() => {
    savePrefs({
      columnOrder: colOrder,
      columnPinning: colPinning,
      columnVisibility: colVisibility,
      columnSizing: colSizing,
    })
  }, [colOrder, colPinning, colVisibility, colSizing, savePrefs])

  const moveColumn = (activeId: string, overId: string) => {
    if (activeId === overId) return
    setColumnOrder((order) =>
      arrayMove(order, order.indexOf(activeId), order.indexOf(overId))
    )
  }

  const contextTable = table as unknown as Table<unknown>

  return (
    <RecordTableContext.Provider
      value={{
        table: contextTable,
        columnSelectorOpen,
        setColumnSelectorOpen,
        draggingColumnId,
        setDraggingColumnId,
        overColumnId,
        setOverColumnId,
        moveColumn,
        setAvailableWidth,
      }}
    >
      <RecordTableContainer
        table={contextTable}
        availableWidth={availableWidth}
        className={className}
        {...restProps}
        ref={ref}
      >
        {children}
      </RecordTableContainer>
    </RecordTableContext.Provider>
  )
}
