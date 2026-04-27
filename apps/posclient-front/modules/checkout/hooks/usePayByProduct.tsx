import { useEffect } from "react"
import { paymentAmountTypeAtom } from "@/store"
import {
  activeOrderIdAtom,
  paidOrderIdAtom,
  paidProductsAtom,
  payByProductAtom,
  payByProductTotalAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import useHandlePayment from "./useHandlePayment"

const usePayByProduct = () => {
  const [paidProducts, setPaidProducts] = useAtom(paidProductsAtom)
  const [payByProduct, setPayByProduct] = useAtom(payByProductAtom)
  const payByProductTotal = useAtomValue(payByProductTotalAtom)
  const paymentAmountType = useAtomValue(paymentAmountTypeAtom)

  const setPaidOrderId = useSetAtom(paidOrderIdAtom)
  const orderIdAtom = useAtomValue(activeOrderIdAtom)

  const { handleValueChange, notPaidAmount } = useHandlePayment()

  const mergePaid = () => {
    const mergedArray = payByProduct.reduce(
      (result, obj1) => {
        const existingObj = result.find((obj2) => obj2._id === obj1._id)

        if (existingObj) {
          // If _id exists, add counts
          existingObj.count += obj1.count
        } else {
          // If _id doesn't exist, push the object to the result array
          result.push({ ...obj1 })
        }

        return result
      },
      [...paidProducts]
    )
    setPaidProducts(mergedArray)
    setPaidOrderId(orderIdAtom)
    setPayByProduct([])
  }

  useEffect(() => {
    if (paymentAmountType === "items" && payByProductTotal > 0) {
      handleValueChange(
        (payByProductTotal > notPaidAmount
          ? notPaidAmount
          : payByProductTotal
        ).toString()
      )
    }
  }, [paymentAmountType, payByProductTotal, handleValueChange, notPaidAmount])

  return { mergePaid, payByProductTotal }
}

export default usePayByProduct
