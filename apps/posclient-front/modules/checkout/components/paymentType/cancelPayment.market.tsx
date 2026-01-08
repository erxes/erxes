import { activeOrderIdAtom, unPaidAmountAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { XIcon } from "lucide-react"

import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import { cn, paidAmounts } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import useAddPayment from "../../hooks/useAddPayment"
import { submitClassName } from "./paymentType.market"

const CancelPayment = ({ type, amount }: { type: string; amount: number }) => {
  const { addPayment, loading } = useAddPayment()
  const notPaid = useAtomValue(unPaidAmountAtom)
  const _id = useAtomValue(activeOrderIdAtom)

  if (
    ALL_BANK_CARD_TYPES.includes(type) ||
    type === "mobileAmount" ||
    notPaid > 0
  )
    return <div className="w-9" />

  const sendAmount = amount * -1

  const getAmount = () => {
    if (type === "cash") return { cashAmount: sendAmount }
    if (type === "mobile") return { mobileAmount: sendAmount }
    return { paidAmounts: paidAmounts(type, sendAmount) }
  }

  return (
    <Button
      className={cn(submitClassName, "bg-amber-500 hover:bg-amber-500/90")}
      iconOnly={true}
      loading={loading}
      onClick={() => addPayment({ variables: { _id, ...getAmount() } })}
    >
      <XIcon className="h-4 w-4" />
    </Button>
  )
}

export default CancelPayment
