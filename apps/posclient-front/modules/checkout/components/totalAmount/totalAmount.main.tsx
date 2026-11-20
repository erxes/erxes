import { orderNumberAtom, previewTotalAmountAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { Hash } from "lucide-react"

import { formatNum } from "@/lib/utils"

const TotalAmount = () => {
  const number = useAtomValue(orderNumberAtom)
  const total = useAtomValue(previewTotalAmountAtom)
  return (
    <div className="col-span-2 flex items-end justify-between px-1 pb-1 leading-none">
      <div className="mr-2 flex items-baseline gap-0.5 rounded-lg bg-background px-2 py-1.5 shadow-xs">
        {number && (
          <Hash className="h-3 w-3 text-muted-foreground" strokeWidth={3} />
        )}
        <div className="text-sm font-bold leading-none">{number?.split("_")[1]}</div>
        <small className="text-xs font-normal leading-none text-muted-foreground">
          {number?.split("_")[0]}
        </small>
      </div>
      <div className="text-right">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Нийт
        </div>
        <div className="text-2xl font-bold tracking-tight">
          {formatNum(total)}₮
        </div>
      </div>
    </div>
  )
}

export default TotalAmount
