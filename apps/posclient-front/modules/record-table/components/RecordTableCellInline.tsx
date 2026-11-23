import React from "react"

import { cn } from "@/lib/utils"

export const RecordTableInlineCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-8 w-full items-center gap-2 overflow-hidden px-2 text-left font-normal",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
RecordTableInlineCell.displayName = "RecordTableInlineCell"

export const RecordTableInlineAnchor = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={(event) => {
      event.stopPropagation()
      onClick?.(event)
    }}
    className={cn(
      "inline-flex h-6 w-fit min-w-32 max-w-full items-center truncate rounded-sm border border-border/60 bg-accent px-2 text-left text-[13px] font-medium transition-colors hover:border-border hover:bg-muted focus-visible:shadow-focus focus-visible:outline-hidden",
      className
    )}
    {...props}
  >
    <span className="truncate">{children}</span>
  </button>
))
RecordTableInlineAnchor.displayName = "RecordTableInlineAnchor"
