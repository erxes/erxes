import useHandlePayment from "@/modules/checkout/hooks/useHandlePayment"
import usePayByProduct from "@/modules/checkout/hooks/usePayByProduct"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import { checkoutModalViewAtom, currentPaymentTypeAtom } from "@/store"
import { useAtom, useSetAtom } from "jotai"

import { HARD_PAYMENT_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

import PaymentTypeHandlers from "./paymentTypeHandlers"
import PaymentTypeInput from "./paymentTypeInput"

const PaymentType = () => {
  const { getLabel } = usePaymentLabel()
  const [paymentTerm, setPaymentTerm] = useAtom(currentPaymentTypeAtom)
  const { handlePay, loading, currentAmount, notPaidAmount, type } =
    useHandlePayment()
  const { mergePaid } = usePayByProduct()
  const setView = useSetAtom(checkoutModalViewAtom)

  return (
    <div className="p-3 min-h-[36rem]">
      <h2 className="text-base font-bold mb-3 flex items-center gap-4">
        {getLabel(paymentTerm) + ":"}
      </h2>
      <div className="p-1 border-b pb-2 mb-4">
        <PaymentTypeInput />
      </div>
      <PaymentTypeHandlers />
      <Button
        className="bg-green-500 hover:bg-green-500/90 whitespace-nowrap font-bold w-full"
        size={"lg"}
        loading={loading}
        onClick={() => {
          handlePay()
          mergePaid()
        }}
        disabled={
          HARD_PAYMENT_TYPES.includes(type) &&
          (notPaidAmount === 0 || currentAmount === 0)
        }
      >
        Гүйлгээ хийх
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="mt-2 w-full"
        onClick={() => {
          setView("")
          setPaymentTerm("")
        }}
      >
        Буцах
      </Button>
    </div>
  )
}

export default PaymentType
