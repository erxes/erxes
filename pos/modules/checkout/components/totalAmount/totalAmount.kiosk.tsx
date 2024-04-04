import { totalAmountAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { cn, formatNum } from "@/lib/utils"

const TotalAmount = ({ className }: { className?: string }) => {
  const total = useAtomValue(totalAmountAtom)
  return <span className={cn("pl-0.5", className)}>{formatNum(total)}₮</span>
}

export default TotalAmount
