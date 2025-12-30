import { modeAtom } from "@/store"
import { orderValuesAtom, setOnOrderChangeAtom } from "@/store/order.store"
import { ApolloError, useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { Customer } from "@/types/customer.types"
import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const onError = (error: ApolloError) => {
  toast({ description: error.message, variant: "destructive" })
}

const useOrderCU = (onCompleted?: (id: string, isPre?: boolean) => void) => {
  const { customer, type, _id, slotCode, ...rest } =
    useAtomValue(orderValuesAtom)

  const origin = useAtomValue(modeAtom)
  const onOrderChange = useSetAtom(setOnOrderChangeAtom)

  // TODO: get type default from config
  const variables = {
    ...rest,
    _id,
    customerId: (customer as Customer)?._id,
    origin,
    type: type || "eat",
    slotCode: slotCode || null,
  }

  const [ordersAdd, { loading }] = useMutation(mutations.ordersAdd, {
    variables,
    onCompleted(data) {
      const { _id, isPre } = (data || {}).ordersAdd || {}
      onOrderChange()
      onCompleted && onCompleted(_id, isPre)
    },
    onError,
    refetchQueries: ["PoscSlots"],
  })

  const [ordersEdit, { loading: loadingEdit }] = useMutation(
    mutations.ordersEdit,
    {
      variables,
      onCompleted(data) {
        const { _id } = (data || {}).ordersEdit || {}
        onOrderChange()
        return onCompleted && onCompleted(_id)
      },
      onError(error) {
        if (error.message !== "Order is already paid") {
          return onError(error)
        }
        ordersAdd()
      },
      refetchQueries: ["orderDetail", "PoscSlots"],
    }
  )

  return {
    orderCU: _id ? ordersEdit : ordersAdd,
    loading: loading || loadingEdit,
    variables,
  }
}

export default useOrderCU
