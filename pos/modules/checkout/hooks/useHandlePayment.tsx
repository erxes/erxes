import { currentAmountAtom, currentPaymentTypeAtom } from "@/store"
import { activeOrderIdAtom, unPaidAmountAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ALL_BANK_CARD_TYPES, HARD_PAYMENT_TYPES } from "@/lib/constants"
import { paidAmounts } from "@/lib/utils"

import useAddPayment from "./useAddPayment"

const useHandlePayment = () => {
  const [currentAmount, setCurrentAmount] = useAtom(currentAmountAtom)
  const notPaidAmount = useAtomValue(unPaidAmountAtom)
  const type = useAtomValue(currentPaymentTypeAtom)
  const setOpenSheet = useSetAtom(paymentSheetAtom)
  const _id = useAtomValue(activeOrderIdAtom)

  const { addPayment, loading } = useAddPayment()

  const handleValueChange = (val: string) => {
    const numericValue = parseFloat(
      val.replace(
        HARD_PAYMENT_TYPES.includes(type) ? /[^0-9.]/g : /[^0-9.-]/g,
        ""
      )
    )
    if (!isNaN(numericValue)) {
      setCurrentAmount(
        numericValue > notPaidAmount
          ? type === "cash"
            ? numericValue
            : notPaidAmount
          : numericValue
      )
    } else {
      setCurrentAmount(0)
    }
  }

  const handlePay = () => {
    if (type === "mobile" || ALL_BANK_CARD_TYPES.includes(type)) {
      return setOpenSheet(true)
    }
    if (type === "cash") {
      return addPayment({
        variables: {
          _id,
          cashAmount:
            currentAmount > notPaidAmount ? notPaidAmount : currentAmount,
        },
      })
    }

    if (type) {
      addPayment({
        variables: {
          _id,
          paidAmounts: paidAmounts(type, currentAmount),
        },
      })
    }
  }
  return {
    type,
    handleValueChange,
    handlePay,
    loading,
    currentAmount,
    notPaidAmount,
    setCurrentAmount,
  }
}

export default useHandlePayment
