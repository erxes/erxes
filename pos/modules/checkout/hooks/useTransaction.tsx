import { currentAmountAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { setPaymentSheetAtom } from "@/store/ui.store"
import { useAtom } from "jotai"

import { paidAmounts } from "@/lib/utils"

import useAddPayment from "./useAddPayment"

const useTransaction = (type: string) => {
  const [amount] = useAtom(currentAmountAtom)
  const [_id] = useAtom(activeOrderIdAtom)
  const [, setPaymentSheet] = useAtom(setPaymentSheetAtom)
  const closePaymentSheet = () => setPaymentSheet(false)

  const { addPayment } = useAddPayment({
    onError: closePaymentSheet,
  })

  const handleAddPayment = (info?: any) =>
    addPayment({
      variables: {
        _id,
        paidAmounts: paidAmounts(type, amount, info),
      },
      onCompleted: closePaymentSheet,
    })

  return { amount, _id, closePaymentSheet, handleAddPayment }
}

export default useTransaction
