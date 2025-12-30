import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import PaymentType from "@/modules/checkout/components/paymentType/PaymentType"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import { currentPaymentTypeAtom } from "@/store"
import { useAtom } from "jotai"

import { Badge } from "@/components/ui/badge"

const Payment = () => {
  const [paymentTerm, setPaymentTerm] = useAtom(currentPaymentTypeAtom)
  const { getLabel } = usePaymentLabel()
  const paymentType = useSearchParams().get("paymentType")

  useEffect(() => {
    if (paymentType) {
      setPaymentTerm(paymentType)
      return
    }
    setPaymentTerm("")
  }, [paymentType])

  return (
    <div className="mr-4 w-7/12 flex flex-col">
      <h2 className="text-base font-bold mb-3">
        {paymentTerm
          ? getLabel(paymentTerm) + ":"
          : "Төлбөрийн нөхцөлөө сонгоно уу."}{" "}
        {!!paymentType && (
          <Badge
            variant="outline"
            className="ml-4 border-2 border-green-500 text-green-500 font-bold"
          >
            Дэд захиалга
          </Badge>
        )}
      </h2>
      {paymentTerm ? <PaymentType /> : <SelectPaymentTypeMain />}
    </div>
  )
}

export default Payment
