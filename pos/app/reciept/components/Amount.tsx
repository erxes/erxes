import { useCallback } from "react"
import { cartAtom } from "@/store/cart.store"
import { ebarimtConfigAtom } from "@/store/config.store"
import {
  cashAmountAtom,
  mobileAmountAtom,
  orderTotalAmountAtom,
  paidAmountsAtom,
} from "@/store/order.store"
import { useAtom } from "jotai"

import { cn, formatNum, getSumsOfAmount } from "@/lib/utils"

const Amount = () => {
  const [cash] = useAtom(cashAmountAtom)
  const [mobile] = useAtom(mobileAmountAtom)
  const [total] = useAtom(orderTotalAmountAtom)
  const [items] = useAtom(cartAtom)
  const [config] = useAtom(ebarimtConfigAtom)
  const [paidAmounts] = useAtom(paidAmountsAtom)
  const { paymentTypes } = config || {}

  const discountAmounts = useCallback(() => {
    return (items || []).reduce(
      (totalDiscount, item) => totalDiscount + (item.discountAmount || 0),
      0
    )
  }, [items])

  return (
    <div className="font-base text-[11px]">
      <div className="flex items-center justify-between border-t  font-semibold">
        <p>Нийт үнэ</p>
        <p>{formatNum(total)}</p>
      </div>
      <Field text="Хөнгөлөлт" val={discountAmounts()} />
      <Field text="Бэлнээр" val={cash} />
      <Field text="Мобайл" val={mobile} />
      {Object.values(getSumsOfAmount(paidAmounts, paymentTypes)).map(
        (i: any) => (
          <Field text={i.title} val={i.value} key={i.title} />
        )
      )}
    </div>
  )
}

const Field = ({
  text,
  val,
  className,
}: {
  text: string
  val: number
  className?: string
}) => {
  if (!val) return null

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p>{text}</p>
      <p>{formatNum(val)}</p>
    </div>
  )
}

export default Amount
