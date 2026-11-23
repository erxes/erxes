import React from "react"
import { format } from "date-fns"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  formatRelativeDate,
  formatRelativeDateShort,
} from "./formatRelativeDate"

type DateValue = string | Date | null | undefined

const RelativeDateDisplayTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipTrigger>,
  Omit<React.ComponentPropsWithoutRef<typeof TooltipTrigger>, "value"> & {
    value: DateValue
  }
>(({ value, ...props }, ref) => {
  if (!value) {
    return null
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger className="truncate" {...props} ref={ref} />
        <TooltipContent className="tabular-nums">
          {format(new Date(value), "yyyy.MM.dd HH:mm")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

RelativeDateDisplayTooltip.displayName = "RelativeDateDisplayTooltip"

const RelativeDateDisplayValue = ({
  value,
  isShort,
}: {
  value: DateValue
  isShort?: boolean
}) => {
  if (!value) {
    return null
  }

  return (
    <>{isShort ? formatRelativeDateShort(value) : formatRelativeDate(value)}</>
  )
}

export const RelativeDateDisplay = Object.assign(RelativeDateDisplayTooltip, {
  Value: RelativeDateDisplayValue,
})
