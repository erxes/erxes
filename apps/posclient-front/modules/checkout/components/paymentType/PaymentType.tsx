import { useSearchParams } from "next/navigation"
import useHandlePayment from "@/modules/checkout/hooks/useHandlePayment"
import usePayByProduct from "@/modules/checkout/hooks/usePayByProduct"
import SplitOrder from "@/modules/orders/components/splitOrder/splitOrder"

import { HARD_PAYMENT_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

import PaymentTypeHandlers from "./paymentTypeHandlers"
import PaymentTypeInput from "./paymentTypeInput"

const PaymentType = () => {
  const { handlePay, loading, currentAmount, notPaidAmount, type } =
    useHandlePayment()
  const paymentType = useSearchParams().get("paymentType")
  const { mergePaid } = usePayByProduct()
  const disabled =
    notPaidAmount === 0 ||
    currentAmount === 0 ||
    (HARD_PAYMENT_TYPES.includes(type) && currentAmount < 0)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-background px-4 py-3 shadow-xs">
        <PaymentTypeInput />
      </div>
      <PaymentTypeHandlers />
      <div className="flex items-center gap-2">
        {!disabled && !paymentType && <SplitOrder />}
        <Button
          size="lg"
          className="h-12 flex-auto rounded-xl text-base font-semibold"
          loading={loading}
          onClick={() => {
            handlePay()
            mergePaid()
          }}
          disabled={disabled}
        >
          Гүйлгээ хийх
        </Button>
      </div>
    </div>
  )
}

export default PaymentType
