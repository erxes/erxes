import { useEffect } from "react"
import { useGolomtTransaction } from "@/modules/checkout/hooks/useGolomt"
import useTransaction from "@/modules/checkout/hooks/useTransaction"

import { BANK_CARD_TYPES } from "@/lib/constants"

import TerminalUI from "./terminalUI"

const GolomtSheet = () => {
  const { amount, _id, closePaymentSheet, handleAddPayment } = useTransaction(
    BANK_CARD_TYPES.GOLOMT
  )
  const { sendTransaction } = useGolomtTransaction({
    onCompleted(data) {
      handleAddPayment(data)
    },
    onError: closePaymentSheet,
  })

  useEffect(() => {
    sendTransaction({ amount, _id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <TerminalUI />
}

export default GolomtSheet
