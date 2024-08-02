import { useSearchParams } from "next/navigation"
import useHandlePayment from "@/modules/checkout/hooks/useHandlePayment"
import usePayByProduct from "@/modules/checkout/hooks/usePayByProduct"
import SplitOrder from "@/modules/orders/components/splitOrder/splitOrder"
import { currentPaymentTypeAtom } from "@/store"
import { useSetAtom } from "jotai"
import { XIcon } from "lucide-react"

import { HARD_PAYMENT_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

import PaymentTypeHandlers from "./paymentTypeHandlers"
import PaymentTypeInput from "./paymentTypeInput"

const PaymentType = () => {
  const setPaymentTerm = useSetAtom(currentPaymentTypeAtom)
  const { handlePay, loading, currentAmount, notPaidAmount, type } =
    useHandlePayment()
  const paymentType = useSearchParams().get("paymentType")
  const { mergePaid } = usePayByProduct()
  const disabled =
    HARD_PAYMENT_TYPES.includes(type) &&
    (notPaidAmount === 0 || currentAmount === 0)

  return (
    <>
      <div className="flex justify-between items-center p-1 border-b border-white/20 pb-2 mb-4">
        <div className="flex-auto">
          <PaymentTypeInput />
        </div>
        <div className="flex-auto flex items-center">
          {!disabled && !paymentType && <SplitOrder />}
          <Button
            className="bg-green-500 hover:bg-green-500/90 whitespace-nowrap font-bold"
            loading={loading}
            onClick={() => {
              handlePay()
              mergePaid()
            }}
            disabled={disabled}
          >
            Гүйлгээ хийх
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="px-2 h-8 hover:bg-slate-900 hover:text-white"
            onClick={() => setPaymentTerm("")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <PaymentTypeHandlers />
    </>
  )
}

export default PaymentType
