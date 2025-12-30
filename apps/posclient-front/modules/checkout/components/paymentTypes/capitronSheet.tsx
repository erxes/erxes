import { useEffect } from "react"
import { useCapitronTransaction } from "@/modules/checkout/hooks/useCapitron"
import useTransaction from "@/modules/checkout/hooks/useTransaction"
import { currentPaymentTypeAtom } from "@/store"
import { useAtomValue } from "jotai"

import TerminalUI from "./terminalUI"

const CapitronSheet = () => {
  const type = useAtomValue(currentPaymentTypeAtom)
  const { amount, _id, closePaymentSheet, handleAddPayment } =
    useTransaction(type)
  const { capitronTransaction } = useCapitronTransaction({
    onCompleted: handleAddPayment,
    onError: closePaymentSheet,
  })

  useEffect(() => {
    capitronTransaction({
      _id: _id || "",
      amount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <TerminalUI />
}

export default CapitronSheet
