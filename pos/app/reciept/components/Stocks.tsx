import { ebarimtConfigAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import { IItem, IReceipt } from "@/types/order.types"
import { formatNum } from "@/lib/utils"

const Stocks = ({ receipts }: { receipts: IReceipt[] }) => {
  const { hasSumQty } = useAtomValue(ebarimtConfigAtom) || {}
  const renderItem = (item: IItem, index: number) => {
    const { unitPrice, totalAmount, name, qty } = item
    const discount = unitPrice * qty - totalAmount

    return (
      <div key={item.name}>
        <div className="receipt-print__stock-name">
          <div>
            {index + 1}. {name}
          </div>
        </div>
        <div className="receipt-print__stock-row">
          <div className="text-right tabular-nums">{formatNum(unitPrice)}</div>
          <div className="text-right tabular-nums">{formatNum(qty)}</div>
          <div className="text-right tabular-nums">{formatNum(discount)}</div>
          <div className="font-semibold text-right tabular-nums">
            {formatNum(totalAmount)}
          </div>
        </div>
      </div>
    )
  }

  const renderReceipt = (receipt: IReceipt) => {
    const { items } = receipt

    return (
      <div>
        <div className="pb-1 space-y-1" key={receipt._id}>
          {(items || []).map((item, ind) => renderItem(item, ind))}
        </div>
        {hasSumQty && (
          <div className="pt-1 pb-0 -mb-1 border-t border-black/15">
            <div className="receipt-print__stock-row">
              <div className="font-semibold text-right">Дүн:</div>
              <div className="text-right tabular-nums">
                {formatNum(items.reduce((sum, i) => sum + i.qty, 0))}
              </div>
              <div className="text-right tabular-nums">
                {formatNum(
                  items.reduce(
                    (sum, i) => sum + (i.unitPrice * i.qty - i.totalAmount),
                    0
                  )
                )}
              </div>
              <div className="font-semibold text-right tabular-nums">
                {formatNum(items.reduce((sum, i) => sum + i.totalAmount, 0))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="receipt-print__section">
      <div className="receipt-print__stock-head">
        <div className="text-center">Үнэ</div>
        <div className="text-center">Тоо</div>
        <div className="text-center">Хөн</div>
        <div className="text-center">Нийт</div>
      </div>
      <div className="py-1 space-y-1 font-normal">
        {(receipts || []).map((receipt) => renderReceipt(receipt))}
      </div>
    </div>
  )
}

export default Stocks
