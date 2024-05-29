import { coverConfigAtom, permissionConfigAtom } from "@/store/config.store"
import { paidAmountsAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

const useRenderEbarimt = () => {
  const coverConfig = useAtomValue(coverConfigAtom)
  const { isTempBill } = useAtomValue(permissionConfigAtom) || {}
  const { paymentTypes } = coverConfig || {}
  const paidAmounts = useAtomValue(paidAmountsAtom)

  const skipEbarimtPts = paymentTypes
    ?.filter((pt) => pt?.config?.skipEbarimt)
    .map((pt) => pt.type)

  const skipEbarimt =
    paidAmounts.reduce(
      (total, pa) =>
        skipEbarimtPts?.includes(pa.type) ? total + pa.amount : total,
      0
    ) > 0

  return { allowInnerBill: isTempBill, skipEbarimt }
}

export default useRenderEbarimt
