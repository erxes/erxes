import { useState } from "react"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import {
  endPoint,
  headers,
  method,
  objToString,
} from "@/modules/checkout/hooks/useTDB"
import { paymentTypesAtom } from "@/store/config.store"
import { tdbResponseAtom } from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { onError } from "@/components/ui/use-toast"

import BankAmountUi from "./bank-amount-ui"

const TDB = () => {
  const [tdbResponse, setTdbResponse] = useAtom(tdbResponseAtom)
  const [loading, setLoading] = useState(false)
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const { getLabel } = usePaymentLabel()

  const bank = paymentTypes.find((pt) => BANK_CARD_TYPES.TDB === pt.type)

  const getTDBCover = () => {
    setLoading(true)
    const details = {
      operation: "Settlement",
      hostIndex: 0,
      ecrRefNo: 0,
    }
    fetch(endPoint(bank?.config?.port), {
      method,
      headers,
      body: objToString(details),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.ecrResult?.RespCode === "00") {
          setTdbResponse(JSON.stringify(res.ecrResult))
        } else {
          onError(`${res.ecrResult.RespCode} - Unexpected error occurred`)
        }
        setLoading(false)
      })
      .catch((e) => {
        onError(e?.message)
        setLoading(false)
      })
  }

  return (
    <BankAmountUi
      name={getLabel(bank?.type || "")}
      type={bank?.type || ""}
      loading={loading}
      descriptionDisabled
      getCover={getTDBCover}
      description={tdbResponse}
    />
  )
}

export default TDB
