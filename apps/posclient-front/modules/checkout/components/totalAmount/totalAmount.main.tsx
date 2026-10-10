import { orderNumberAtom, previewTotalAmountAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { Hash } from "lucide-react"

import { formatNum } from "@/lib/utils"

const TotalAmount = () => {
  const number = useAtomValue(orderNumberAtom)
  const total = useAtomValue(previewTotalAmountAtom)
  return (
    <div className="col-span-2 flex items-center justify-between text-base font-extrabold leading-none">
      <div className="flex items-baseline gap-0.5 mr-2">
        {number && <Hash className="h-3 w-3" strokeWidth={3} />}
        <div className="font-black leading-none">{number?.split("_")[1]}</div>
        <small className="font-normal text-xs leading-none">
          {number?.split("_")[0]}
        </small>
      </div>
      <div>{formatNum(total)}₮</div>
    </div>
  )
}

export default TotalAmount
