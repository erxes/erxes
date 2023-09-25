import dynamic from "next/dynamic"
import {
  cashAmountAtom,
  mobileAmountAtom,
  paidAmountsAtom,
} from "@/store/order.store"
import { useAtomValue } from "jotai"

import { getMode, mergePaidAmounts } from "@/lib/utils"

const Market = dynamic(
  () => import("./paidType.market"),

  {
    loading: () => <div className="h-10 w-full" />,
  }
)
const Main = dynamic(
  () => import("./paidType.main"),

  {
    loading: () => <div className="h-8 w-full" />,
  }
)

const PaidTypes = () => {
  const cashAmount = useAtomValue(cashAmountAtom)
  const mobileAmount = useAtomValue(mobileAmountAtom)
  const paidAmounts = useAtomValue(paidAmountsAtom)

  const PaidType = getMode() === "market" ? Market : Main

  return (
    <>
      {!!cashAmount && <PaidType type="cash" amount={cashAmount} />}
      {!!mobileAmount && <PaidType type="mobile" amount={mobileAmount} />}
      {!!paidAmounts.length &&
        mergePaidAmounts(paidAmounts).map(
          ({ amount, type }) =>
            !!amount && <PaidType amount={amount} type={type} key={type} />
        )}
    </>
  )
}

export default PaidTypes
