import useUser from "@/modules/auth/hooks/useUser"
import { coverConfigAtom, permissionConfigAtom } from "@/store/config.store"
import { paidAmountsAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

const useRenderEbarimt = () => {
  const coverConfig = useAtomValue(coverConfigAtom)
  const permissionConfig = useAtomValue(permissionConfigAtom)
  const { isAdmin } = useUser()
  const { paymentTypes } = coverConfig || {}
  const { admins, cashiers } = permissionConfig || {}
  const paidAmounts = useAtomValue(paidAmountsAtom)

  const allowInnerBill = isAdmin ? admins?.isTempBill : cashiers?.isTempBill

  const skipEbarimtPts = paymentTypes
    ?.filter((pt) => pt?.config?.skipEbarimt)
    .map((pt) => pt.type)

  const skipEbarimt =
    paidAmounts.reduce(
      (total, pa) =>
        skipEbarimtPts?.includes(pa.type) ? total + pa.amount : total,
      0
    ) > 0

  return { allowInnerBill, skipEbarimt }
}

export default useRenderEbarimt
