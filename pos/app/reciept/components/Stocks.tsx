import { IItem, IReceipt } from "@/types/order.types"
import { formatNum } from "@/lib/utils"

const Stocks = ({ receipts }: { receipts: IReceipt[] }) => {
  const renderItem = (item: IItem) => {
    const { unitPrice, totalAmount, name, qty } = item

    return (
      <div key={item.name}>
        <div className="flex items-start leading-none">
          <div className="w-6/12 line-clamp-2">{name}</div>
          <div className="w-3/12 text-center">
            {formatNum(unitPrice)} x {formatNum(qty)}
          </div>
          <div className="w-3/12 text-right">{formatNum(totalAmount)}</div>
        </div>
      </div>
    )
  }

  const renderReceipt = (receipt: IReceipt) => {
    const { items } = receipt

    return (
      <div className="space-y-1" key={receipt._id}>
        {(items || []).map((item) => renderItem(item))}
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
        {(receipts || []).map((receipt) => renderReceipt(receipt))}
      </div>
    </div>
  )
}

export default Stocks
