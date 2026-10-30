import { format } from "date-fns"
import { BANK_CARD_TYPES } from "@/lib/constants"
import { BankAmountUi } from "./bank-amount-ui"
import {
  useCoverTerminalFetch,
  readTerminalResponse,
} from "../hooks/useCoverTerminalFetch"

export const Khaan = () => {
  const { fetchTerminal, loading } = useCoverTerminalFetch()
  const getCover = () =>
    fetchTerminal(BANK_CARD_TYPES.KHANBANK, async () => {
      const response = await fetch("http://localhost:27028", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: "doSettlement",
          service_params: { db_ref_no: format(new Date(), "yyyyMMHHmmss") },
        }),
      })
      return readTerminalResponse(response)
    })
  return (
    <BankAmountUi
      name="Хаан банк"
      type={BANK_CARD_TYPES.KHANBANK}
      getCover={getCover}
      loading={loading}
    />
  )
}
