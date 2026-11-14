import { Clock } from "lucide-react"

import { describeSchedule } from "@/lib/pricingReason"
import { cn } from "@/lib/utils"

import { usePricingSchedule } from "../hooks/usePricingSchedule"

const TONE_CLASS = {
  active: "bg-green-50 text-green-800",
  ending: "bg-amber-50 text-amber-800",
  idle: "bg-neutral-100 text-neutral-600",
}

// Why the cart's lines are or are not discounted by a scheduled plan right now.
export const PricingScheduleBanner = () => {
  const { statuses, now, hasOrder } = usePricingSchedule()

  if (!statuses.length) return null

  return (
    <div className="mt-2 space-y-1">
      {statuses.map((status) => {
        const { tone, text } = describeSchedule(status, now, hasOrder)

        return (
          <div
            key={status.planId}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs",
              TONE_CLASS[tone]
            )}
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">{text}</span>
          </div>
        )
      })}
    </div>
  )
}
