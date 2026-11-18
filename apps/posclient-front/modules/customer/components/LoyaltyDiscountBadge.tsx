import { loyaltyPreviewAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { OrderItem } from "@/types/order.types"
import { formatReason } from "@/lib/pricingReason"
import { fixNum } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type DiscountInfos = OrderItem["discountInfos"]

const autoInfos = (discountInfos: DiscountInfos) =>
  (discountInfos || []).filter(({ type }) => type !== "hand")

// The percent each discount was given at, so a later count change does not
// spread a fixed amount thinner.
const savedPercent = (discountInfos: DiscountInfos) =>
  autoInfos(discountInfos).reduce((sum, { percent }) => sum + (percent || 0), 0)

// What priced the line: saved reasons first, then what a save would give.
const useLineReason = (itemId: string, discountInfos: DiscountInfos) => {
  const preview = useAtomValue(loyaltyPreviewAtom)
  const saved = autoInfos(discountInfos)
  const title =
    saved
      .map(({ title }) => title)
      .filter(Boolean)
      .join(", ") || preview[itemId]?.title
  const reasons = saved.length
    ? saved.flatMap(({ reasons }) => reasons || [])
    : preview[itemId]?.reasons || []

  return {
    percent: savedPercent(discountInfos) || preview[itemId]?.percent,
    title,
    reasons,
  }
}

// A saved line shows what the server gave; an unsaved one what a save would give.
export const LoyaltyDiscountBadge = ({
  itemId,
  discountInfos,
}: {
  itemId: string
  discountInfos: DiscountInfos
}) => {
  const { percent } = useLineReason(itemId, discountInfos)

  if (!percent) return null

  if (percent < 0) {
    return (
      <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
        +{fixNum(-percent, 1)}%
      </span>
    )
  }

  return (
    <span className="ml-1 rounded bg-green-100 px-1 text-[10px] font-semibold text-green-700">
      −{fixNum(percent, 1)}%
    </span>
  )
}

// The plan behind a line's discount, with its window and moment on hover.
export const LoyaltyDiscountReason = ({
  itemId,
  discountInfos,
}: {
  itemId: string
  discountInfos: DiscountInfos
}) => {
  const { percent, title, reasons } = useLineReason(itemId, discountInfos)

  if (!percent || !title) return null

  const window = reasons.find(({ window }) => window)
  const summary = window ? formatReason(window) : title

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <small className="mt-0.5 block truncate text-[10px] leading-3 text-green-700">
            {summary}
          </small>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {reasons.length ? (
            reasons.map((reason) => (
              <p key={`${reason.planId}-${reason.kind}`}>
                {formatReason(reason)}
              </p>
            ))
          ) : (
            <p>{title}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
