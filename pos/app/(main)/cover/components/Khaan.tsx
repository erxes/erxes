import { useState } from "react"
import { useSettlement } from "@/modules/checkout/hooks/useKhanCard"
import { format } from "date-fns"

import { BANK_CARD_TYPES } from "@/lib/constants"

import BankAmountUi from "./bank-amount-ui"

const Khaan = () => {
  const [description, setDescription] = useState<any>()
  const { sendSettlement, loading } = useSettlement({
    onCompleted(response) {
      setDescription(response)
    },
  })
  return (
    <BankAmountUi
      name="Хаан банк"
      type={BANK_CARD_TYPES.KHANBANK}
      getCover={() =>
        sendSettlement({ number: format(new Date(), "yyyyMMHHmmss") })
      }
      loading={loading}
      description={description}
      descriptionDisabled
    />
  )
}

export default Khaan
