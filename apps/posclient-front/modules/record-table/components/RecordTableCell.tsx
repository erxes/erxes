import React from "react"
import { Cell } from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import { TableCell } from "./Table"

export const RecordTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    cell: Cell<unknown, unknown>
  }
>(({ children, className, cell, style, ...props }, ref) => {
  const { column } = cell
  const pinned = column.getIsPinned()

  return (
    <TableCell
      ref={ref}
      className={cn(
        "isolate p-0 transition-colors",
        pinned && "sticky z-1",
        className
      )}
      style={{
        width: `var(--col-${column.id}-width)`,
        left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </TableCell>
  )
})
RecordTableCell.displayName = "RecordTableCell"
