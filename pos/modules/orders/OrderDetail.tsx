import { useEffect } from "react"
import { orderCollapsibleAtom, refetchOrderAtom } from "@/store"
import { cartChangedAtom } from "@/store/cart.store"
import { configAtom } from "@/store/config.store"
import { activeOrderIdAtom, setOrderStatesAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { gql, useLazyQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import Loader from "@/components/ui/loader"
import { onError } from "@/components/ui/use-toast"

import { queries, subscriptions } from "./graphql"

const OrderDetail = ({
  children,
  inCheckout,
}: {
  children: React.ReactNode
  inCheckout?: boolean
}) => {
  const _id = useAtomValue(activeOrderIdAtom)
  const isChanged = useAtomValue(cartChangedAtom) //ene heregtei shuu
  const { token } = useAtomValue(configAtom) || {}
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const setPaymentSheet = useSetAtom(paymentSheetAtom)
  const setRefetchOrder = useSetAtom(refetchOrderAtom)
  const setOrderCollapsible = useSetAtom(orderCollapsibleAtom)

  const [getOrderDetail, { loading, data, refetch, subscribeToMore }] =
    useLazyQuery(queries.orderDetail, {
      fetchPolicy: "network-only",
      onError({ message }) {
        onError(message)
      },
    })

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    const { orderDetail } = data || {}
    if (orderDetail?._id === _id) {
      setOrderStates(orderDetail)
      inCheckout && setOrderCollapsible(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id, data, setOrderStates])

  useEffect(() => {
    !!_id && getOrderDetail({ variables: { _id } })
  }, [_id, getOrderDetail])

  if (loading) return <Loader />

  return <>{children}</>
}

export default OrderDetail
