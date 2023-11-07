import { currentAmountAtom, currentPaymentTypeAtom } from "@/store"
import { paymentConfigAtom } from "@/store/config.store"
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
  const [config] = useAtom(paymentConfigAtom)
  const { paymentTypes } = config || {}

  return paymentTypes?.find((pt) => pt.type === type)
}

export const useCheckNotSplit = () => {
  const config = useAtomValue(paymentConfigAtom)
  const { paymentTypes: pTs } = config || {}
  const cashAmount = useAtomValue(cashAmountAtom)
  const mobileAmount = useAtomValue(mobileAmountAtom)
  const paidAmounts = useAtomValue(paidAmountsAtom)
  const unPaidAmount = useAtomValue(unPaidAmountAtom)
  const setCurrentAmount = useSetAtom(currentAmountAtom)
  const [paymentType, setType] = useAtom(currentPaymentTypeAtom)
  const paymentTypes = filterPaymentTypes(pTs)

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

  const disableInput = notSplitPts.includes(paymentType || "")

  return { mappedPts, handleSetType, disableInput, paidNotSplit }
}

export default usePaymentType
