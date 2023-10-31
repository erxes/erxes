import PaymentType from "@/modules/checkout/components/paymentType/paymentType.main"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import { currentPaymentTypeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Payment = () => {
  const paymentTerm = useAtomValue(currentPaymentTypeAtom)
  const { getLabel } = usePaymentLabel()

  return (
    <div className="mr-4 w-7/12">
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
