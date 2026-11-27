import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import PaymentType from "@/modules/checkout/components/paymentType/PaymentType"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import { currentPaymentTypeAtom } from "@/store"
import { useAtom } from "jotai"
import { ArrowLeftIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    <div className="flex w-7/12 flex-col">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        {paymentTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Буцах"
            onClick={() => setPaymentTerm("")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        )}
        {paymentTerm
          ? getLabel(paymentTerm) + ":"
          : "Төлбөрийн нөхцөлөө сонгоно уу."}{" "}
        {!!paymentType && (
          <Badge
            variant="outline"
            className="ml-2 border-primary/40 font-semibold text-primary"
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
