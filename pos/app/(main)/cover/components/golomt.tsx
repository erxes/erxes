import { useState } from "react"
import { endPoint, initialData } from "@/modules/checkout/hooks/useGolomt"
import { paymentTypesAtom } from "@/store/config.store"
import { golomtResponseAtom } from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { getLocal, parseBase64 } from "@/lib/utils"

import BankAmountUi from "./bank-amount-ui"
import { onError } from '@/components/ui/use-toast'

const Golomt = () => {
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const [response, setResponse] = useAtom(golomtResponseAtom)
  const [loading, setLoading] = useState(false)
  const terminalID = getLocal("golomtId")

  const golomt = paymentTypes.find((pt) => pt.type === BANK_CARD_TYPES.GOLOMT)

  const handleFetchCover = () => {
    setLoading(true)
    fetch(
      endPoint(
        { ...initialData, ...golomt?.config, operationCode: "59", terminalID },
        golomt?.config?.port || ""
      )
    )
      .then((res) => res.json())
      .then((res) => {
        const terminalRes = JSON.parse(res?.PosResult)
        if (terminalRes?.responseCode === "00") {
          const recieptData = parseBase64(terminalRes?.data)
          setResponse(JSON.stringify(recieptData))
        } else {
          onError(terminalRes.responseDesc)
        }
        setLoading(false)
      })
      .catch((e) => {
        onError(e?.message)
        setLoading(false)
      })
  }

  if (!golomt) {
    return null
  }

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
