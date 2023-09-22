import { useEffect } from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import useHandlePayment from "../../hooks/useHandlePayment"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import PaymentSheet from "./paymentSheet"
import SelectPaymentType from "./selectPaymentType.market"

const PaymentType = () => {
  const {
    handleValueChange,
    handlePay,
    loading,
    currentAmount,
    notPaidAmount,
    setCurrentAmount,
  } = useHandlePayment()

  const { disableInput } = useCheckNotSplit()

  useEffect(() => {
    setCurrentAmount(notPaidAmount)
  }, [notPaidAmount, setCurrentAmount])

  return (
    <div className="mb-2 flex items-center">
      <div className="flex flex-auto">
        <div className="w-1/2 pr-1">
          <SelectPaymentType />
        </div>
        <div className="w-1/2 pl-1">
          <Input
            value={currentAmount.toLocaleString()}
            disabled={disableInput || loading}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        </div>
      </div>
      <Button
        className={cn(submitClassName, "bg-green-500 hover:bg-green-500/90")}
        loading={loading}
        iconOnly={true}
        onClick={handlePay}
      >
        <CheckIcon className=" h-4 w-4" />
      </Button>
      <PaymentSheet />
    </div>
  )
}

export const submitClassName = "ml-2 h-auto flex-none rounded-full p-0.5"

export default PaymentType
