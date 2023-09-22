import { useState } from "react"
import { endPoint, initialData } from "@/modules/checkout/hooks/useGolomt"
import { coverConfigAtom } from "@/store/config.store"
import { golomtResponseAtom } from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { parseBase64 } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

import BankAmountUi from "./bank-amount-ui"

const Golomt = () => {
  const config = useAtomValue(coverConfigAtom)
  const [response, setResponse] = useAtom(golomtResponseAtom)
  const [loading, setLoading] = useState(false)
  const { onError } = useToast()

  const golomt = config?.paymentTypes.find(
    (pt) => pt.type === BANK_CARD_TYPES.GOLOMT
  )

  const handleFetchCover = () => {
    setLoading(true)
    fetch(
      endPoint(
        { ...initialData, operationCode: "59" },
        golomt?.config?.path || ""
      )
    )
      .then((res) => res.json())
      .then((res) => {
        const terminalRes = JSON.parse(res?.PosResult)
        if (terminalRes?.responseCode === "00") {
          const recieptData = parseBase64(terminalRes?.data)
          setResponse(JSON.stringify(recieptData))
        } else {
          onError({ message: terminalRes.responseDesc })
        }
        setLoading(false)
      })
      .catch((e) => {
        onError(e)
        setLoading(false)
      })
  }

  if (!golomt) return null

  return (
    <BankAmountUi
      name="Голомт банк"
      type={BANK_CARD_TYPES.GOLOMT}
      loading={loading}
      descriptionDisabled
      description={response}
      getCover={handleFetchCover}
    />
  )
}

export default Golomt
