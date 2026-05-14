import { useEffect, useRef } from "react"
import { CheckIcon } from "lucide-react"

import { HARD_PAYMENT_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import useHandlePayment from "../../hooks/useHandlePayment"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import SelectPaymentType from "./selectPaymentType.market"

const PaymentType = () => {
  const {
    handleValueChange,
    handlePay,
    loading,
    currentAmount,
    notPaidAmount,
    setCurrentAmount,
    type,
  } = useHandlePayment()
  const amountRef = useRef<HTMLInputElement | null>(null)

  const { disableInput } = useCheckNotSplit()

  useEffect(() => {
    setCurrentAmount(notPaidAmount)
  }, [notPaidAmount, setCurrentAmount])

  const onSelectType = () => {
    setTimeout(() => amountRef.current?.focus(), 200)
  }

  return (
    <form
      className="mb-2 flex items-center"
      onSubmit={(e) => {
        e.preventDefault()
        handlePay()
      }}
    >
      <div className="flex flex-auto gap-2">
        <div className="w-1/2">
          <SelectPaymentType onSelect={onSelectType} />
        </div>
        <div className="w-1/2">
          <Input
            value={currentAmount.toLocaleString()}
            disabled={disableInput || loading}
            onChange={(e) => handleValueChange(e.target.value)}
            ref={amountRef}
          />
        </div>
      </div>
      <Button
        className={cn(submitClassName, "bg-green-500 hover:bg-green-500/90")}
        loading={loading}
        iconOnly={true}
        type="submit"
        disabled={
          HARD_PAYMENT_TYPES.includes(type) &&
          (notPaidAmount === 0 || currentAmount === 0)
        }
      >
        <CheckIcon className=" h-4 w-4" />
      </Button>
    </form>
  )
}

export const submitClassName = "ml-2 h-auto flex-none rounded-full p-0.5"

export default PaymentType
