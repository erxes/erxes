import { coverConfigAtom } from "@/store/config.store"
import { calcAmountsAtom } from "@/store/cover.store"
import { useAtom } from "jotai"

import { ALL_BANK_CARD_TYPES } from "@/lib/constants"

import Amount from "./amount"

const CustomAmounts = () => {
  const [config] = useAtom(coverConfigAtom)
  const [calcAmounts] = useAtom(calcAmountsAtom)
  const { paymentTypes, paymentIds } = config || {}

  const nonBankPts = (paymentTypes || []).filter(
    (pt) => !ALL_BANK_CARD_TYPES.includes(pt.type)
  )
  if (paymentIds?.length) {
    nonBankPts.push({
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
