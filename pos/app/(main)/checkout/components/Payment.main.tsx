import { useEffect } from "react"
import PaymentType from "@/modules/checkout/components/paymentType/PaymentType"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import { currentPaymentTypeAtom } from "@/store"
import { useAtom } from "jotai"

const Payment = () => {
  const [paymentTerm, setPaymentTerm] = useAtom(currentPaymentTypeAtom)
  const { getLabel } = usePaymentLabel()

  useEffect(() => {
    // reset on go back
    setPaymentTerm("")
  }, [])

  return (
    <div className="mr-4 w-7/12 flex flex-col">  
      <h2 className="text-base font-bold mb-3">
        {paymentTerm
          ? getLabel(paymentTerm) + ":"
          : "Төлбөрийн нөхцөлөө сонгоно уу."}
      </h2>
      {paymentTerm ? <PaymentType /> : <SelectPaymentTypeMain />}
    </div>
  )
}

export default Payment


