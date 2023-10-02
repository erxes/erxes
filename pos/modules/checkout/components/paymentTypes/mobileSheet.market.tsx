import useAddPayment from "@/modules/checkout/hooks/useAddPayment"
import useMobilePayment from "@/modules/checkout/hooks/useMobilePayment"
import { currentAmountAtom } from "@/store"
import { activeOrderAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom } from "jotai"

import Loader from "@/components/ui/loader"

const MobileSheet = () => {
  const [currentAmount] = useAtom(currentAmountAtom)
  const [_id] = useAtom(activeOrderAtom)
  const [, setOpenSheet] = useAtom(paymentSheetAtom)

  // description

  const { addPayment, loading: loadingAdd } = useAddPayment()
  const { invoiceUrl, loading } = useMobilePayment({
    amount: currentAmount,
    onCompleted: (paidAmount) => {
      addPayment({
        variables: {
          _id,
          mobileAmount: paidAmount,
        },
        onCompleted: () => setOpenSheet(false),
      })
    },
  })

  if (loading || loadingAdd) return <Loader />

  if (!invoiceUrl) return <div></div>

  return <iframe src={invoiceUrl} className="min-h-full relative z-10" />
}

export default MobileSheet
