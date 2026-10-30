import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import {
  endPoint,
  headers,
  method,
  objToString,
} from "@/modules/checkout/hooks/useTDB"
import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { BANK_CARD_TYPES } from "@/lib/constants"
import { BankAmountUi } from "./bank-amount-ui"
import {
  useCoverTerminalFetch,
  readTerminalResponse,
} from "../hooks/useCoverTerminalFetch"

export const Capitron = () => {
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const { getLabel } = usePaymentLabel()
  const bank = paymentTypes.find((pt) => pt.type === BANK_CARD_TYPES.CAPITRON)
  const { fetchTerminal, loading } = useCoverTerminalFetch()
  const getCover = () =>
    fetchTerminal(BANK_CARD_TYPES.CAPITRON, async () => {
      const response = await fetch(endPoint(bank?.config?.port), {
        method,
        headers,
        body: objToString({
          operation: "Settlement",
          hostIndex: 0,
          ecrRefNo: 0,
        }),
      })
      return readTerminalResponse(response)
    })
  return (
    <BankAmountUi
      name={getLabel(bank?.type || "")}
      type={BANK_CARD_TYPES.CAPITRON}
      loading={loading}
      getCover={getCover}
    />
  )
}
