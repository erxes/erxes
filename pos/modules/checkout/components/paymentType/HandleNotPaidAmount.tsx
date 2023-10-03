import { useEffect } from "react"
import { currentAmountAtom, currentPaymentTypeAtom } from "@/store"
import { unPaidAmountAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtomValue, useSetAtom } from "jotai"

import { getMode } from "@/lib/utils"

const HandleNotPaidAmount = () => {
  const notPaidAmount = useAtomValue(unPaidAmountAtom)
  const setCurrentAmount = useSetAtom(currentAmountAtom)
  const changeOpen = useSetAtom(paymentSheetAtom)
  const chengeCurrent = useSetAtom(currentPaymentTypeAtom)

  useEffect(() => {
    setCurrentAmount(notPaidAmount)
    changeOpen(false)
    getMode() !== "market" && chengeCurrent("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notPaidAmount])

  return null
}

export default HandleNotPaidAmount
