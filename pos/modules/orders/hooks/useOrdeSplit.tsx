import { useRouter } from "next/navigation"
import { currentPaymentTypeAtom, paymentAmountTypeAtom } from "@/store"
import {
  orderValuesAtom,
  resetPayByProductAtom,
  splitOrderItemsAtom,
} from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { getCartTotal, getItemInputs } from "@/lib/utils"
import { onError } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useSplitOrder = () => {
  const { mainItems, subItems } = useAtomValue(splitOrderItemsAtom)
  const totalAmount = getCartTotal(mainItems)
  const variables = useAtomValue(orderValuesAtom)
  const paymentType = useAtomValue(currentPaymentTypeAtom)
  const router = useRouter()
  const setAmountType = useSetAtom(paymentAmountTypeAtom)
  const reset = useSetAtom(resetPayByProductAtom)

  const [ordersAdd, { loading }] = useMutation(mutations.ordersAdd, {
    variables: {
      ...variables,
      items: getItemInputs(subItems),
      totalAmount: getCartTotal(subItems),
    },
    onCompleted(data) {
      const { _id } = data?.ordersAdd || {}
      reset()
      router.push(
        `/checkout?orderId=${_id}&paymentType=${paymentType}&mainOrder=${variables._id}`
      )
      setAmountType("amount")
    },
  })

  const [ordersEdit, { loading: loadingEdit }] = useMutation(
    mutations.ordersEdit,
    {
      variables: {
        ...variables,
        items: getItemInputs(mainItems),
        totalAmount: getCartTotal(mainItems),
      },
      onError({ message }) {
        return onError(message)
      },
      refetchQueries: ["orderDetail", "PoscSlots"],
    }
  )

  const splitOrder = () => {
    ordersAdd()
    ordersEdit()
  }

  return {
    splitOrder,
    disabled: totalAmount <= 0 || getCartTotal(subItems) <= 0,
    loading: loadingEdit || loading,
  }
}

export default useSplitOrder
