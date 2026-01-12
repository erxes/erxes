import { currentAmountAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useAtom, useSetAtom } from "jotai"

import { paidAmounts } from "@/lib/utils"

import useAddPayment from "./useAddPayment"
import { paymentSheetAtom } from '@/store/ui.store'

const useTransaction = (type: string) => {
  const [amount] = useAtom(currentAmountAtom)
  const [_id] = useAtom(activeOrderIdAtom)
  const setPaymentSheet = useSetAtom(paymentSheetAtom)
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
