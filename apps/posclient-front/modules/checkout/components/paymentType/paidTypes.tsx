import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import {
  cashAmountAtom,
  directDiscountAtom,
  directIsAmountAtom,
  mobileAmountAtom,
  orderTotalAmountAtom,
  paidAmountsAtom,
} from "@/store/order.store"
import { useAtomValue } from "jotai"

import { mergePaidAmounts } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Market: any = dynamic(() => import("./paidType.market"), {
  loading: () => <div className="h-10 w-full" />,
})
const Main: any = dynamic(
  () => import("./paidType.main"),

  {
    loading: () => <div className="h-8 w-full" />,
  }
)

const PaidTypes = () => {
  const cashAmount = useAtomValue(cashAmountAtom)
  const mobileAmount = useAtomValue(mobileAmountAtom)
  const paidAmounts = useAtomValue(paidAmountsAtom)
  const directDiscount = useAtomValue(directDiscountAtom)
  const directIsAmount = useAtomValue(directIsAmountAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  const mode = useAtomValue(modeAtom)

  const PaidType = mode === "market" ? Market : Main

  return (
    <>
      {mode === "main" && (
        <Label className="block pb-2">Төлбөрийн төрөл:</Label>
      )}
      {!!cashAmount && <PaidType type="cash" amount={cashAmount} />}
      {!!mobileAmount && <PaidType type="mobile" amount={mobileAmount} />}
      {!!paidAmounts.length &&
        mergePaidAmounts(paidAmounts).map(
          ({ amount, type }) =>
            !!amount && <PaidType amount={amount} type={type} key={type} />
        )}
      {!!directDiscount && (
        <>
          <PaidType
            type="total"
            amount={
              directIsAmount
                ? totalAmount + directDiscount
                : (totalAmount / (100 - directDiscount)) * 100
            }
          />
          <PaidType
            type="discount"
            amount={directDiscount}
            percent={!directIsAmount}
          />
        </>
      )}
    </>
  )
}

export default PaidTypes
