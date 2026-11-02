import { endPoint, initialData } from "@/modules/checkout/hooks/useGolomt"
import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { z } from "zod"
import { BANK_CARD_TYPES } from "@/lib/constants"
import { getLocal, parseBase64 } from "@/lib/utils"
import { BankAmountUi } from "./bank-amount-ui"
import {
  useCoverTerminalFetch,
  readTerminalResponse,
} from "../hooks/useCoverTerminalFetch"

export const Golomt = () => {
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const golomt = paymentTypes.find((pt) => pt.type === BANK_CARD_TYPES.GOLOMT)
  const { fetchTerminal, loading } = useCoverTerminalFetch()
  const getCover = () =>
    fetchTerminal(BANK_CARD_TYPES.GOLOMT, async () => {
      const response = await fetch(
        endPoint(
          {
            ...initialData,
            ...golomt?.config,
            portNo: getLocal("golomtPortNo") || initialData.portNo,
            operationCode: "59",
            terminalID: getLocal("golomtId"),
          },
          golomt?.config?.port || ""
        )
      )
      const { result, httpStatus } = await readTerminalResponse(response)
      let receipt: unknown
      try {
        const parsed = z.object({ PosResult: z.string() }).parse(result)
        const terminal = z
          .object({ data: z.string().optional() })
          .parse(JSON.parse(parsed.PosResult))
        if (terminal.data) receipt = parseBase64(terminal.data)
      } catch {
        /* The original response is retained even when decoding fails. */
      }
      return { httpStatus, result, receipt }
    })
  if (!golomt) return null
  return (
    <BankAmountUi
      name="Голомт банк"
      type={BANK_CARD_TYPES.GOLOMT}
      loading={loading}
      getCover={getCover}
    />
  )
}
