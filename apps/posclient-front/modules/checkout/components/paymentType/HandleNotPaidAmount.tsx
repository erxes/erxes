import { useEffect } from "react"
import { currentAmountAtom, currentPaymentTypeAtom, modeAtom } from "@/store"
import { unPaidAmountAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtomValue, useSetAtom } from "jotai"

const HandleNotPaidAmount = () => {
  const notPaidAmount = useAtomValue(unPaidAmountAtom)
  const setCurrentAmount = useSetAtom(currentAmountAtom)
  const changeOpen = useSetAtom(paymentSheetAtom)
  const changeCurrent = useSetAtom(currentPaymentTypeAtom)
  const mode = useAtomValue(modeAtom)

  useEffect(() => {
    setCurrentAmount(notPaidAmount)
    changeOpen(false)
    mode === "market" && changeCurrent("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notPaidAmount])

  return null
}

export default HandleNotPaidAmount
