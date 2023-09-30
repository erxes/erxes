import { totalAmountAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { formatNum } from "@/lib/utils"

const TotalAmount = () => {
  const total = useAtomValue(totalAmountAtom)
  return (
    <div className="col-span-2 flex items-center justify-between text-base font-extrabold">
      <span>Нийт дүн:</span>
      <span>{formatNum(total)}₮</span>
    </div>
  )
}

export default TotalAmount
