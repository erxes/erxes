import { loyaltyPreviewAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { OrderItem } from "@/types/order.types"
import { fixNum } from "@/lib/utils"

// A saved line shows what the server gave; an unsaved one what a save would give.
export const LoyaltyDiscountBadge = ({
  productId,
  discountInfos,
}: Pick<OrderItem, "productId" | "discountInfos">) => {
  const preview = useAtomValue(loyaltyPreviewAtom)
  const saved = (discountInfos || []).find(({ type }) => type === "voucher")
  const percent = saved?.percent || preview[productId]

  if (!percent) return null

  return (
    <span className="ml-1 rounded bg-green-100 px-1 text-[10px] font-semibold text-green-700">
      −{fixNum(percent, 1)}%
    </span>
  )
}
