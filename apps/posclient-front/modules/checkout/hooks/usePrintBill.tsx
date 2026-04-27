import { mutations } from "@/modules/checkout/graphql"
import { modeAtom } from "@/store"
import {
  activeOrderIdAtom,
  billTypeAtom,
  paidDateAtom,
  registerNumberAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { ebarimtSheetAtom } from "@/store/ui.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { BILL_TYPES } from "@/lib/constants"
import useTab from "@/lib/useTab"
import { onError } from "@/components/ui/use-toast"

import useRenderEbarimt from "./useRenderBillTypes"

const usePrintBill = (onCompleted?: () => void) => {
  const mode = useAtomValue(modeAtom)
  const _id = useAtomValue(activeOrderIdAtom)
  const billType = useAtomValue(billTypeAtom)
  const registerNumber = useAtomValue(registerNumberAtom)
  const paidDate = useAtomValue(paidDateAtom)
  const unPaidAmount = useAtomValue(unPaidAmountAtom)
  const changeVisiblity = useSetAtom(ebarimtSheetAtom)
  const { skipEbarimt } = useRenderEbarimt()
  const disabled = unPaidAmount > 0
  const { openNewWindow } = useTab(() => !!onCompleted && onCompleted())

  const [settlePayment, { loading }] = useMutation(
    mutations.ordersSettlePayment,
    {
      variables: {
        _id,
        billType: skipEbarimt ? BILL_TYPES.INNER : billType,
        registerNumber:
          billType === BILL_TYPES.ENTITY ? registerNumber : undefined,
      },
      onCompleted() {
        if (mode === "mobile") {
          return openNewWindow("/reciept/ebarimt?id=" + _id)
        }
        !!onCompleted && onCompleted()
        changeVisiblity(true)
      },
      onError({ message }) {
        onError(message)
      },
    }
  )

  const printBill = () => {
    if (disabled) return onError("Төлбөрөө бүрэн төлнө үү")
    if (!!paidDate) return changeVisiblity(true)
    if (billType === "3" && !registerNumber) {
      return onError("Байгуулга РД-аа зөв оруулана уу")
    }
    return settlePayment()
  }

  return { loading, printBill, changeVisiblity, disabled }
}

export default usePrintBill
