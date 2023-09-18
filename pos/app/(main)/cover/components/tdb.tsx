import { useState } from "react"
import {
  endPoint,
  headers,
  method,
  objToString,
} from "@/modules/checkout/hooks/useTDB"
import { coverConfigAtom } from "@/store/config.store"
import { tdbResponseAtom } from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"

import BankAmountUi from "./bank-amount-ui"

const TDB = () => {
  const [tdbResponse, setTdbResponse] = useAtom(tdbResponseAtom)
  const [loading, setLoading] = useState(false)
  const config = useAtomValue(coverConfigAtom)
  const { onError } = useToast()

  const tdb = config?.paymentTypes.find((pt) => pt.type === BANK_CARD_TYPES.TDB)

  const getTDBCover = () => {
    setLoading(true)
    const details = {
      operation: "Settlement",
      hostIndex: 0,
      ecrRefNo: 0,
    }
    fetch(endPoint(tdb?.config?.port), {
      method,
      headers,
      body: objToString(details),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.ecrResult?.RespCode === "00") {
          setTdbResponse(JSON.stringify(res.ecrResult))
        } else {
          onError({
            message: `${res.ecrResult.RespCode} - Unexpected error occured`,
          })
        }
        setLoading(false)
      })
      .catch((e) => {
        onError(e)
        setLoading(false)
      })
  }

  return (
    <BankAmountUi
      name="Худалдаа хөгжилийн банк"
      type={BANK_CARD_TYPES.TDB}
      loading={loading}
      descriptionDisabled
      getCover={getTDBCover}
      description={tdbResponse}
    />
  )
}

export default TDB
