import React from "react"

import { cn } from "@/lib/utils"

import { Table } from "./Table"

export const RecordTableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, style, ...props }, ref) => (
  <Table
    ref={ref}
    className={cn("leading-none", className)}
    style={{ width: "var(--table-width)", ...style }}
    {...props}
  />
))
RecordTableRoot.displayName = "RecordTableRoot"
