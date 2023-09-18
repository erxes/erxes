import { useEffect } from "react"
import { useSendTransaction } from "@/modules/checkout/hooks/useKhanCard"
import useTransaction from "@/modules/checkout/hooks/useTransaction"
import { orderNumberAtom } from "@/store/order.store"
import { useAtom } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"

import TerminalUI from "./terminalUI"

const KhanCardSheet = () => {
  const [number] = useAtom(orderNumberAtom)
  const { amount, closePaymentSheet, handleAddPayment } = useTransaction(
    BANK_CARD_TYPES.KHANBANK
  )

  const { sendTransaction } = useSendTransaction({
    onCompleted: handleAddPayment,
    onError: closePaymentSheet,
  })

  useEffect(() => {
    sendTransaction({ amount, number, billType: "1" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <TerminalUI />
}

export default KhanCardSheet
