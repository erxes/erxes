import useUser from "@/modules/auth/hooks/useUser"
import { paymentConfigAtom } from "@/store/config.store"
import { paidAmountsAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

const useRenderEbarimt = () => {
  const [paymentConfig] = useAtom(paymentConfigAtom)
  const { isAdmin } = useUser()
  const { permissionConfig, paymentTypes } = paymentConfig || {}
  const { admins, cashiers } = permissionConfig || {}
  const paidAmounts = useAtomValue(paidAmountsAtom)

  const allowInnerBill = isAdmin ? admins?.isTempBill : cashiers?.isTempBill

  const skipEbarimtPts = paymentTypes
    ?.filter((pt) => pt?.config?.skipEbarimt)
    .map((pt) => pt.type)

  const skipEbarimt = !!paidAmounts.find((pa) =>
    skipEbarimtPts?.includes(pa.type)
  )

  return { allowInnerBill, skipEbarimt }
}

export default useRenderEbarimt
