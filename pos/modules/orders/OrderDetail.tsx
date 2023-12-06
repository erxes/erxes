import { useEffect } from "react"
import { invoiceIdAtom, refetchOrderAtom } from "@/store"
import { cartChangedAtom } from "@/store/cart.store"
import { configAtom } from "@/store/config.store"
import { activeOrderIdAtom, setOrderStatesAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { gql, useLazyQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries, subscriptions } from "./graphql"

const OrderDetail = ({ children }: { children: React.ReactNode }) => {
  const _id = useAtomValue(activeOrderIdAtom)
  const isChanged = useAtomValue(cartChangedAtom) //ene heregtei shuu
  const { token } = useAtomValue(configAtom) || {}
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const setPaymentSheet = useSetAtom(paymentSheetAtom)
  const setRefetchOrder = useSetAtom(refetchOrderAtom)
  const invoiceId = useAtomValue(invoiceIdAtom)
  const { onError } = useToast()

  const [getOrderDetail, { loading, data, refetch, subscribeToMore }] =
    useLazyQuery(queries.orderDetail, {
      fetchPolicy: "network-only",
      onError,
    })

  useEffect(() => {
    if (invoiceId) {
      subscribeToMore({
        document: gql(subscriptions.ordersOrdered),
        variables: { token, statuses: ORDER_STATUSES.ALL },
        updateQuery: (prev, { subscriptionData }) => {
          const { ordersOrdered } = subscriptionData.data || {}
          if (!ordersOrdered) return prev
          if (ordersOrdered._id === _id) {
            refetch()
            setRefetchOrder(true)
            setPaymentSheet(false)
          }
          return prev
        },
      })
    }
  }, [
    _id,
    invoiceId,
    refetch,
    setPaymentSheet,
    setRefetchOrder,
    subscribeToMore,
    token,
  ])

  useEffect(() => {
    const { orderDetail } = data || {}
    if (orderDetail?._id === _id) {
      setOrderStates(orderDetail)
    }
  }, [_id, data, setOrderStates])

  useEffect(() => {
    !!_id && getOrderDetail({ variables: { _id } })
  }, [_id, getOrderDetail])

  if (loading) return <Loader />

  return <>{children}</>
}

export default OrderDetail
