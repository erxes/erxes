import { mutations } from "@/modules/checkout/graphql"
import {
  activeOrderAtom,
  billTypeAtom,
  paidDateAtom,
  registerNumberAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { setEbarimtSheetAtom } from "@/store/ui.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { BILL_TYPES } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"

import useRenderEbarimt from "./useRenderBillTypes"

const usePrintBill = (onCompleted?: () => void) => {
  const _id = useAtomValue(activeOrderAtom)
  const billType = useAtomValue(billTypeAtom)
  const registerNumber = useAtomValue(registerNumberAtom)
  const paidDate = useAtomValue(paidDateAtom)
  const unPaidAmount = useAtomValue(unPaidAmountAtom)
  const changeVisiblity = useSetAtom(setEbarimtSheetAtom)
  const { onError } = useToast()
  const { skipEbarimt } = useRenderEbarimt()
  const disabled = unPaidAmount > 0

  const [settlePayment, { loading }] = useMutation(
    mutations.ordersSettlePayment,
    {
      variables: {
        _id,
        billType: skipEbarimt ? BILL_TYPES.INNER : billType,
        registerNumber,
      },
      onCompleted() {
        !!onCompleted && onCompleted()
        changeVisiblity(true)
      },
      refetchQueries: ["orderDetail"],
      onError,
    }
  )

  const printBill = () => {
    if (disabled)
      return onError({
        message: "Төлбөрөө бүрэн төлнө үү",
      })
    if (!!paidDate) return changeVisiblity(true)
    if (billType === "3" && !registerNumber)
      return onError({
        message: "Байгуулга РД-аа зөв оруулана уу",
      })
    return settlePayment()
  }

  return { loading, printBill, changeVisiblity, disabled }
}

export default usePrintBill
