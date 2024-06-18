import { useRouter } from "next/navigation"
import { currentPaymentTypeAtom } from "@/store"
import { orderValuesAtom, splitOrderItemsAtom } from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtomValue } from "jotai"

import { getCartTotal, getItemInputs } from "@/lib/utils"
import { onError } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useSplitOrder = () => {
  const { mainItems, subItems } = useAtomValue(splitOrderItemsAtom)
  const totalAmount = getCartTotal(mainItems)
  const variables = useAtomValue(orderValuesAtom)
  const paymentType = useAtomValue(currentPaymentTypeAtom)
  const router = useRouter()

  const [ordersAdd, { loading }] = useMutation(mutations.ordersAdd, {
    variables: {
      ...variables,
      items: getItemInputs(subItems),
      totalAmount: getCartTotal(subItems),
    },
    onCompleted(data) {
      const { _id } = data?.ordersAdd || {}
      router.push(
        `/checkout?orderId=${_id}&paymentType=${paymentType}&mainOrder=${variables._id}`
      )
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
      onError(error) {
        return onError(error)
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
    disabled: totalAmount <= 0,
    loading: loadingEdit || loading,
  }
}

export default useSplitOrder
