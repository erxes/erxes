import { useEffect } from "react"
import { useTDBTransaction } from "@/modules/checkout/hooks/useTDB"
import useTransaction from "@/modules/checkout/hooks/useTransaction"
import { currentPaymentTypeAtom } from "@/store"
import { useAtomValue } from "jotai"

import TerminalUI from "./terminalUI"

const TDBCardSheet = () => {
  const type = useAtomValue(currentPaymentTypeAtom)
  const { amount, _id, closePaymentSheet, handleAddPayment } =
    useTransaction(type)
  const { TDBTransaction } = useTDBTransaction({
    onCompleted: handleAddPayment,
    onError: closePaymentSheet,
  })

  useEffect(() => {
    TDBTransaction({
      _id: _id || "",
      amount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <TerminalUI />
}

export default TDBCardSheet
