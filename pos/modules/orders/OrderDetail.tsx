import { useEffect } from "react"
import { invoiceIdAtom } from "@/store"
import { cartChangedAtom } from "@/store/cart.store"
import { activeOrderIdAtom, setOrderStatesAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { gql, useLazyQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries, subscriptions } from "./graphql"

const OrderDetail = ({ children }: { children: React.ReactNode }) => {
  const _id = useAtomValue(activeOrderIdAtom)
  const isChanged = useAtomValue(cartChangedAtom) //ene heregtei shuu
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const setPaymentSheet = useSetAtom(paymentSheetAtom)
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
        document: gql(subscriptions.invoiceUpdated),
        variables: { _id: invoiceId },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          refetch()
          setPaymentSheet(false)
          return prev
        },
      })
    }
  }, [invoiceId, subscribeToMore])

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
