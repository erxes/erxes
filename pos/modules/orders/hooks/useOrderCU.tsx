import { modeAtom, refetchOrderAtom, refetchUserAtom } from "@/store"
import { cartChangedAtom } from "@/store/cart.store"
import { orderValuesAtom } from "@/store/order.store"
import { ApolloError, useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { Customer } from "@/types/customer.types"
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useOrderCU = (onCompleted?: (id: string) => void) => {
  const { toast } = useToast()
  const { customer, type, _id, slotCode, ...rest } =
    useAtomValue(orderValuesAtom)

  const origin = useAtomValue(modeAtom)
  const setRefetchUser = useSetAtom(refetchUserAtom)
  const setRefetchOrder = useSetAtom(refetchOrderAtom)
  const setCartChanged = useSetAtom(cartChangedAtom)

  // TODO: get type default from config
  const variables = {
    ...rest,
    _id,
    customerId: (customer as Customer)?._id,
    origin,
    type: type || "eat",
    slotCode: slotCode || null,
  }

  const onError = (error: ApolloError) => {
    toast({ description: error.message, variant: "destructive" })
  }

  const [ordersAdd, { loading }] = useMutation(mutations.ordersAdd, {
    variables,
    onCompleted(data) {
      const { _id } = (data || {}).ordersAdd || {}
      setRefetchUser(true)
      setRefetchOrder(true)
      setCartChanged(false)
      onCompleted && onCompleted(_id)
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
        setRefetchUser(true)
        setRefetchOrder(true)
        setCartChanged(false)
        return onCompleted && onCompleted(_id)
      },
      onError(error) {
        if (origin !== "market") {
          return onError(error)
        }
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
