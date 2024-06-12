import { paymentAmountTypeAtom } from "@/store"
import { payByProductAtom } from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtom } from "jotai"

import { mutations } from "../graphql"

const useSplitOrder = () => {
  const [paymentAmountType, setPaymentAmountType] = useAtom(
    paymentAmountTypeAtom
  )
  const [payByProduct, setPayByProduct] = useAtom(payByProductAtom)

  const variables = {}

  const [ordersAdd, { loading }] = useMutation(mutations.ordersAdd, {
    variables,
    onCompleted(data) {
      const { _id } = (data || {}).ordersAdd || {}
    },
  })

  const splitOrder = () => {}

  return { splitOrder }
}

export default useSplitOrder
