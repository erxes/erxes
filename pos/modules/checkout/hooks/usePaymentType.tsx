import { currentAmountAtom, currentPaymentTypeAtom } from "@/store"
import { paymentTypesAtom } from "@/store/config.store"
import {
  cashAmountAtom,
  mobileAmountAtom,
  paidAmountsAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import { filterPaymentTypes } from "@/lib/utils"

const usePaymentType = (type: string) => {
  const paymentTypes = useAtomValue(paymentTypesAtom)

  return paymentTypes?.find((pt) => pt.type === type)
}

export const useCheckNotSplit = () => {
  const cashAmount = useAtomValue(cashAmountAtom)
  const mobileAmount = useAtomValue(mobileAmountAtom)
  const paidAmounts = useAtomValue(paidAmountsAtom)
  const unPaidAmount = useAtomValue(unPaidAmountAtom)
  const setCurrentAmount = useSetAtom(currentAmountAtom)
  const [currentPaymentType, setType] = useAtom(currentPaymentTypeAtom)
  const paymentTypes = filterPaymentTypes(useAtomValue(paymentTypesAtom))

  const notSplitPts = (paymentTypes || [])
    .filter((pt) => {
      const { notSplit } = pt.config || {}
      return notSplit
    })
    .map((pt) => pt.type)

  const paidNotSplit = !!paidAmounts.find((pa) => notSplitPts.includes(pa.type))

  const mappedPts = (paymentTypes || [])
    .filter((pt) => !ALL_BANK_CARD_TYPES.includes(pt.type))
    .map((pt) => {
      const upPt = (disabled?: boolean) => ({ ...pt, disabled })

      if (pt.config?.notSplit)
        return upPt(
          (paidAmounts.length &&
            !paidAmounts.find((pa) => pa.type === pt.type)) ||
            !!cashAmount ||
            !!mobileAmount
        )

      return upPt(paidNotSplit)
    })

  const handleSetType = (type: string) => {
    if (!notSplitPts.includes(type)) {
      setCurrentAmount(unPaidAmount)
      setType(type)
    }
    setType(type)
  }

  const disableInput = notSplitPts.includes(currentPaymentType || "")

  return {
    mappedPts,
    handleSetType,
    disableInput,
    paidNotSplit,
    currentPaymentType,
  }
}

export default usePaymentType
