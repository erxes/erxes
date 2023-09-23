import { coverConfigAtom } from "@/store/config.store"
import { isCoverAmountsFetchedAtom } from "@/store/cover.store"
import { useAtomValue } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"

import Khaan from "./Khaan"
import CashAmounts from "./cash-amounts"
import CustomAmounts from "./custom-amounts"
import Description from "./description"
import Golomt from "./golomt"
import Tdb from "./tdb"

const { KHANBANK, GOLOMT, TDB } = BANK_CARD_TYPES

const Amounts = () => {
  const isFetched = useAtomValue(isCoverAmountsFetchedAtom)
  const { paymentTypes } = useAtomValue(coverConfigAtom) || {}

  if (!isFetched) return null

  const showBank = (type: string) =>
    paymentTypes?.find((pt) => pt.type === type)

  return (
    <div className="my-4 grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <CashAmounts />
        <Description />
      </div>
      <div className="space-y-2">
        <CustomAmounts />
        {showBank(KHANBANK) && <Khaan />}
        {showBank(GOLOMT) && <Golomt />}
        {showBank(TDB) && <Tdb />}
      </div>
    </div>
  )
}

export default Amounts
