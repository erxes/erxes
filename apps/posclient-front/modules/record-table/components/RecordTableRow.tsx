import React from "react"

import { cn } from "@/lib/utils"

import { TableRow } from "./Table"

export const RecordTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <TableRow ref={ref} className={cn("h-cell", className)} {...props} />
))
RecordTableRow.displayName = "RecordTableRow"
