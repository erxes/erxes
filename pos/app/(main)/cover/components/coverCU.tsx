import { useRouter, useSearchParams } from "next/navigation"
import useUser from "@/modules/auth/hooks/useUser"
import {
  beginDateAtom,
  calcAmountsAtom,
  calcCashAtom,
  cashAtom,
  currentAmountsAtom,
  currentCashTotalAtom,
  descriptionAtom,
  endDateAtom,
  golomtResponseAtom,
  tdbResponseAtom,
} from "@/store/cover.store"
import { useAtomValue } from "jotai"
import { AlarmCheckIcon } from "lucide-react"

import { Detail } from "@/types/cover.types"
import { Button } from "@/components/ui/button"

import useCoverCU from "../hooks/useCoverCU"

const CoverCU = () => {
  const beginDate = useAtomValue(beginDateAtom)
  const endDate = useAtomValue(endDateAtom)
  const description = useAtomValue(descriptionAtom)
  const calcAmounts = useAtomValue(calcAmountsAtom)
  const currentAmounts = useAtomValue(currentAmountsAtom)
  const cash = useAtomValue(cashAtom)
  const calcCash = useAtomValue(calcCashAtom)
  const cashTotal = useAtomValue(currentCashTotalAtom)
  const golomtResponse = useAtomValue(golomtResponseAtom)
  const tdbResponse = useAtomValue(tdbResponseAtom)

  const router = useRouter()

  const { userId } = useUser()
  const id = useSearchParams().get("id")
  const { loading, coverCU } = useCoverCU()

  const handleClick = () => {
    let details = [] as Detail[]

    if (calcCash || cashTotal) {
      details.push({
        ...cash,
        paidSummary: cash.paidSummary.filter((item) => (item.value || 0) > 0),
        paidDetail: calcCash,
      })
    }

    Object.keys(currentAmounts).forEach((item) => {
      if (currentAmounts[item]) {
        details.push({
          _id: Math.random(),
          paidType: item,
          paidSummary: [
            {
              _id: Math.random() + "",
              kindOfVal: 1,
              kind: "1",
              amount: currentAmounts[item],
              value: currentAmounts[item],
            },
          ],
          paidDetail: (calcAmounts || {})[item],
        })
      }
    })

    coverCU({
      variables: {
        id: id === "create" ? null : id,
        userId,
        description: !!description ? description : null,
        beginDate,
        endDate,
        details,
      },
      onCompleted: () => router.push("/cover"),
    })
  }

  if (!endDate) return null
  return (
    <Button className="mt-4" loading={loading} onClick={handleClick}>
      <AlarmCheckIcon className="mr-1 h-4 w-4 -translate-x-1" />
      Хадгалах
    </Button>
  )
}

export default CoverCU
