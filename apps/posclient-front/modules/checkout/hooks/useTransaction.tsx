import { currentAmountAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom, useSetAtom } from "jotai"

import { paidAmounts } from "@/lib/utils"

import useAddPayment from "./useAddPayment"

const useTransaction = (type: string) => {
  const [amount] = useAtom(currentAmountAtom)
  const [_id] = useAtom(activeOrderIdAtom)
  const setPaymentSheet = useSetAtom(paymentSheetAtom)
  const closePaymentSheet = () => setPaymentSheet(false)

  const { addPayment } = useAddPayment({
    onError: closePaymentSheet,
  })

  const handleAddPayment = async (info?: unknown) => {
    if (!_id) {
      throw new Error("Order not found")
    }

    await addPayment({
      variables: {
        _id,
        paidAmounts: paidAmounts(type, amount, info),
      },
      onCompleted: closePaymentSheet,
    })
  }

  return { amount, _id, closePaymentSheet, handleAddPayment }
}

export default useTransaction
