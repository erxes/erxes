import { cartAtom } from "@/store/cart.store"
import { orderNumberAtom, previewTotalAmountAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { Hash } from "lucide-react"

import { formatNum } from "@/lib/utils"

const TotalAmount = ({ receipt = false }: { receipt?: boolean }) => {
  const number = useAtomValue(orderNumberAtom)
  const total = useAtomValue(previewTotalAmountAtom)
  const cart = useAtomValue(cartAtom)
  const [date, num] = (number || "").split("_")

  if (receipt) {
    return (
      <div className="col-span-2 flex items-center justify-between gap-4 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
            Нийт дүн
          </span>
          <span className="truncate text-xl font-semibold leading-tight tracking-tight tabular-nums">
            {formatNum(total)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ₮
            </span>
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground shadow-xs">
          {cart.length} бараа
        </span>
      </div>
    )
  }

  const labelClass =
    "mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"

  return (
    <div className="col-span-2 flex items-end justify-between gap-3 px-1 pb-1 leading-none">
      <div className="min-w-0">
        <div className={labelClass}>Захиалга</div>
        {number ? (
          <div className="flex items-baseline gap-1">
            <Hash
              className="h-3.5 w-3.5 self-center opacity-70"
              strokeWidth={3}
            />
            <span className="text-lg font-bold">{num}</span>
            <small className="text-xs opacity-70">{date}</small>
          </div>
        ) : (
          <div className="text-lg font-semibold">Шинэ</div>
        )}
      </div>
      <div className="text-right">
        <div className={labelClass}>Нийт</div>
        <div className="text-xl font-semibold tracking-tight tabular-nums">
          {formatNum(total)}₮
        </div>
      </div>
    </div>
  )
}

export default TotalAmount
