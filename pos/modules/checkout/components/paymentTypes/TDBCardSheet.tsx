import { useEffect } from "react"
import { useTDBTransaction } from "@/modules/checkout/hooks/useTDB"
import useTransaction from "@/modules/checkout/hooks/useTransaction"

import { BANK_CARD_TYPES } from "@/lib/constants"

import TerminalUI from "./terminalUI"

const TDBCardSheet = () => {
  const { amount, _id, closePaymentSheet, handleAddPayment } = useTransaction(
    BANK_CARD_TYPES.TDB
  )
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
