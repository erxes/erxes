import { useCallback } from "react"
import { cartAtom } from "@/store/cart.store"
import { paymentTypesAtom } from "@/store/config.store"
import {
  cashAmountAtom,
  mobileAmountAtom,
  orderTotalAmountAtom,
  paidAmountsAtom,
} from "@/store/order.store"
import { useAtomValue } from "jotai"

import { cn, formatNum, getSumsOfAmount } from "@/lib/utils"

const Amount = () => {
  const cash = useAtomValue(cashAmountAtom)
  const mobile = useAtomValue(mobileAmountAtom)
  const total = useAtomValue(orderTotalAmountAtom)
  const items = useAtomValue(cartAtom)
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const paidAmounts = useAtomValue(paidAmountsAtom)

  const discountAmounts = useCallback(() => {
    return (items || []).reduce(
      (totalDiscount, item) => totalDiscount + (item.discountAmount || 0),
      0
    )
  }, [items])

  return (
    <div className="font-base text-[11px]">
      <div className="flex items-center justify-between border-t font-semibold pt-1">
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
  if (!val) {
    return null
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p>{text}</p>
      <p>{formatNum(val)}</p>
    </div>
  )
}

export default Amount
