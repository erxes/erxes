import { printTypeAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { formatNum } from "@/lib/utils"
import { IItem, IReceipt } from "@/types/order.types"

const Stocks = ({ receipts }: { receipts: IReceipt[] }) => {
  const type = useAtomValue(printTypeAtom)

  const renderItem = (item: IItem, idx: number) => {
    const { unitPrice, totalAmount, name, qty } = item;

    return (
      <div key={idx}>
        <div className="flex items-start leading-none">
          <div className="w-6/12">{name}</div>
          <div className="w-3/12 text-center">
            {formatNum(unitPrice)} x {formatNum(qty)}
          </div>
          <div className="w-3/12 text-right">{formatNum(totalAmount)}</div>
        </div>
      </div>
    )
  }

  const renderReceipt = (receipt: IReceipt, len: number, idx: number) => {
    const { items } = receipt

    return (
      <div>
        {
          len > 1 && <div className="flex items-center whitespace-nowrap border-b  font-medium">
            <div className="w-12/12">ДДТД: {receipt.id ?? ''}</div>
          </div>
        }
        {(items || []).map((item, idx: number) => renderItem(item, idx))}
        {
          len > 1 && <div className="flex items-center whitespace-nowrap border-b  font-medium">
            <div className="w-6/12">НӨАТ / Нийт:</div>
            <div className="w-3/12 text-right">{formatNum(receipt.totalVAT ?? 0, '1')}</div>
            <div className="w-3/12 text-right">{formatNum(receipt.totalAmount ?? 0)}</div>
          </div>
        }
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
        {(receipts || []).map((receipt, idx: number) => renderReceipt(receipt, receipts.length, idx))}
      </div>
    </div>
  )
}

export default Stocks
