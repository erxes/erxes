import { CSSProperties, forwardRef } from "react"
import { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import { isFixedWidthColumn } from "../utils/columnUtils"

interface RecordTableContainerProps {
  table: Table<unknown>
  availableWidth: number
  children: React.ReactNode
}

const getColumnSizeVars = (table: Table<unknown>, availableWidth: number) => {
  const headers = table.getFlatHeaders()
  const totalWidth = table.getTotalSize()
  const flexWidth = headers.reduce(
    (total, header) =>
      isFixedWidthColumn(header.column) ? total : total + header.getSize(),
    0
  )
  const extraWidth = flexWidth ? Math.max(0, availableWidth - totalWidth) : 0
  const columnSizeVars: Record<string, number | string> = {}
  let tableWidth = 0

  headers.forEach((header) => {
    const size = header.getSize()
    const width = isFixedWidthColumn(header.column)
      ? size
      : Math.floor(size + (extraWidth * size) / flexWidth)
    tableWidth += width

    columnSizeVars[`--header-${header.id}-size`] = size
    columnSizeVars[`--col-${header.column.id}-size`] = header.column.getSize()
    columnSizeVars[`--header-${header.id}-width`] = `${width}px`
    columnSizeVars[`--col-${header.column.id}-width`] = `${width}px`
  })

  return { columnSizeVars, tableWidth }
}

export const RecordTableContainer = forwardRef<
  HTMLDivElement,
  RecordTableContainerProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    { table, availableWidth, className, children, style, ...restProps },
    ref
  ) => {
    const { columnSizeVars, tableWidth } = getColumnSizeVars(
      table,
      availableWidth
    )

    return (
      <div
        ref={ref}
        {...restProps}
        style={
          {
            "--table-width": `${tableWidth}px`,
            ...columnSizeVars,
            ...style,
          } as CSSProperties
        }
        className={cn(
          "relative grow-0 basis-full overflow-hidden rounded-lg border-l-4 border-t-4 border-sidebar bg-sidebar",
          className
        )}
      >
        {children}
      </div>
    )
  }
)

RecordTableContainer.displayName = "RecordTableContainer"
