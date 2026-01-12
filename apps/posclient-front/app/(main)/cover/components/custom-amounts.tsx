import { configAtom } from "@/store/config.store"
import { calcAmountsAtom } from "@/store/cover.store"
import { useAtomValue } from "jotai"

import { ALL_BANK_CARD_TYPES } from "@/lib/constants"

import Amount from "./amount"

const CustomAmounts = () => {
  const { paymentTypes, paymentIds } = useAtomValue(configAtom) || {}
  const calcAmounts = useAtomValue(calcAmountsAtom)

  const nonBankPts = (paymentTypes || []).filter(
    (pt) => !ALL_BANK_CARD_TYPES.includes(pt.type)
  )
  if (paymentIds?.length) {
    nonBankPts.push({
      _id: "mobile",
      type: "mobile",
      title: "Цахимаар",
    })
  }

  return (
    <>
      {[...nonBankPts].map((pt) => (
        <Amount {...pt} amount={(calcAmounts || {})[pt.type]} key={pt.type} />
      ))}
    </>
  )
}

export default CustomAmounts
