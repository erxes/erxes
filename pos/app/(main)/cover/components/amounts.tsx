import { isCoverAmountsFetchedAtom } from "@/store/cover.store"
import { useAtomValue } from "jotai"

import Khaan from "./Khaan"
import CashAmounts from "./cash-amounts"
import CustomAmounts from "./custom-amounts"
import Description from "./description"
import Golomt from "./golomt"
import TDB from "./tdb"

const Amounts = () => {
  const isFetched = useAtomValue(isCoverAmountsFetchedAtom)

  if (!isFetched) return null

  return (
    <div className="my-4 grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <CashAmounts />
        <Description />
      </div>
      <div className="space-y-2">
        <CustomAmounts />
        <Khaan />
        <Golomt />
        <TDB />
      </div>
    </div>
  )
}

export default Amounts
