import { IItem, IReceipt } from "@/types/order.types"
import { formatNum } from "@/lib/utils"
import { useAtomValue } from 'jotai'
import { ebarimtConfigAtom } from '@/store/config.store'

const Stocks = ({ receipts }: { receipts: IReceipt[] }) => {
  const { hasSumQty } = useAtomValue(ebarimtConfigAtom) || {}
  const renderItem = (item: IItem, index: number) => {
    const { unitPrice, totalAmount, name, qty } = item
    const discount = unitPrice * qty - totalAmount;

    return (
      <div key={item.name}>
        <div className="flex items-start leading-none">
          <div className="w-12/12 line-clamp-2">{index + 1}.  {name}</div>
        </div>
        <div className="flex items-start leading-none">
          <div className="w-3/12 text-right"> {formatNum(unitPrice)}</div>
          <div className="w-2/12 text-right">{formatNum(qty)}</div>
          <div className="w-3/12 text-right">{formatNum(discount)}</div>
          <div className="w-4/12 text-right">{formatNum(totalAmount)} </div>
        </div>
      </div>
    )
  }

  const renderReceipt = (receipt: IReceipt) => {
    const { items } = receipt

    return (
      <div>
        <div className="space-y-1 pb-1" key={receipt._id}>
          {(items || []).map((item, ind) => renderItem(item, ind))}
        </div>
        {
          hasSumQty && (
            <div className="pt-1 -mb-1 pb-0 border-t">
              <div className="flex items-start leading-none">
                <div className="w-3/12 text-right">Дүн: </div>
                <div className="w-2/12 text-right">
                  {formatNum(items.reduce((sum, i) => sum + i.qty, 0))}
                </div>
                <div className="w-3/12 text-right">{formatNum(items.reduce((sum, i) => sum + (i.unitPrice * i.qty - i.totalAmount), 0))}</div>
                <div className="w-4/12 text-right">
                  {formatNum(items.reduce((sum, i) => sum + i.totalAmount, 0))}
                </div>
              </div>
            </div>
          )
        }
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center whitespace-nowrap border-b  font-medium">
        <div className="w-3/12 text-center">Үнэ</div>
        <div className="w-2/12 text-center">Тоо</div>
        <div className="w-3/12 text-center">Хөн</div>
        <div className="w-4/12 text-center">Нийт үнэ</div>
      </div>
      <div className="space-y-1 py-1 font-normal">
        {(receipts || []).map((receipt) => renderReceipt(receipt))}
      </div>
    </div>
  )
}

export default Stocks
