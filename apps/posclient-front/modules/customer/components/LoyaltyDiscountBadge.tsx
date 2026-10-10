import { loyaltyPreviewAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { OrderItem } from "@/types/order.types"
import { fixNum } from "@/lib/utils"

// What the line's pricing and loyalty discounts take off its price before them.
const savedPercent = (
  discountInfos: OrderItem["discountInfos"],
  unitPrice: number,
  count: number
) => {
  const infos = discountInfos || []
  const auto = infos
    .filter(({ type }) => type !== "hand")
    .reduce((sum, { amount }) => sum + (amount || 0), 0)
  const all = infos.reduce((sum, { amount }) => sum + (amount || 0), 0)
  const base = unitPrice * count + all

  return auto && base ? (auto / base) * 100 : 0
}

// A saved line shows what the server gave; an unsaved one what a save would give.
export const LoyaltyDiscountBadge = ({
  itemId,
  discountInfos,
  unitPrice,
  count,
}: {
  itemId: string
  discountInfos: OrderItem["discountInfos"]
  unitPrice: number
  count: number
}) => {
  const preview = useAtomValue(loyaltyPreviewAtom)
  const percent =
    savedPercent(discountInfos, unitPrice, count) || preview[itemId]?.percent

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
