import { PackageIcon } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { Badge } from "@/components/ui/badge"

const Items = ({ items }: { items: OrderItem[] }) => {
  if (!items?.length)
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <PackageIcon className="h-8 w-8" strokeWidth={1.5} />
        <span className="text-xs font-medium">Бараа алга</span>
      </div>
    )

  const total = items.reduce(
    (sum, { unitPrice, count }) => sum + unitPrice * count,
    0
  )
  const discount = items.reduce(
    (sum, { discountAmount }) => sum + (discountAmount || 0),
    0
  )

  return (
    <div className="flex flex-col">
      <div className="divide-y">
        {items.map(
          ({
            _id,
            productName,
            unitPrice,
            count,
            discountAmount,
            status,
            isPackage,
            isTake,
            manufacturedDate,
          }) => (
            <div key={_id} className="flex items-start gap-3 px-1 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">
                  {productName}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {unitPrice.toLocaleString()}₮ × {count}
                  </span>
                  {!!status && <Badge variant="secondary">{status}</Badge>}
                  {isTake && <Badge variant="info">Авч явах</Badge>}
                  {isPackage && <Badge variant="outline">Сав баглаа</Badge>}
                  {!!manufacturedDate && (
                    <span>Үйлдвэрлэсэн: {manufacturedDate}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold tabular-nums">
                  {(unitPrice * count).toLocaleString()}₮
                </div>
                {!!discountAmount && (
                  <div className="text-xs tabular-nums text-destructive">
                    −{discountAmount.toLocaleString()}₮
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
      <div className="mt-1 flex flex-col gap-1 border-t px-1 pt-3 text-xs">
        {!!discount && (
          <div className="flex justify-between text-muted-foreground">
            <span>Хямдрал</span>
            <span className="tabular-nums">−{discount.toLocaleString()}₮</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] font-semibold">
          <span>Барааны дүн</span>
          <span className="tabular-nums">{total.toLocaleString()}₮</span>
        </div>
      </div>
    </div>
  )
}

export default Items
