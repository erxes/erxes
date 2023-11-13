import { printTypeAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { formatNum } from "@/lib/utils"

interface IStock {
  unitPrice: number
  totalAmount: number
  name: string
  qty: number
}

const Stocks = ({ stocks }: { stocks: IStock[] }) => {
  const type = useAtomValue(printTypeAtom)

  const renderItem = (item: any, idx: number) => {
    const { unitPrice, totalAmount, name, qty, shortName } = item
    return (
      <div key={idx}>
        <div className="flex items-start leading-none">
          <div className="w-6/12">{!type ? shortName ?? name : name}</div>
          <div className="w-3/12 text-center">
            {formatNum(unitPrice)} x {formatNum(qty)}
          </div>
          <div className="w-3/12 text-right">{formatNum(totalAmount)}</div>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center whitespace-nowrap border-b  font-medium">
        <div className="w-6/12">Бараа</div>
        <div className="w-3/12 text-center">Үнэ x Ш</div>
        <div className="w-3/12 text-right">Нийт үнэ</div>
      </div>
      <div className="space-y-1 py-1">
        {(stocks || []).map((item, idx: number) => renderItem(item, idx))}
      </div>
    </div>
  )
}

export default Stocks
