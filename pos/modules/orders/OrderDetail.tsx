import { useEffect } from "react"
import { activeOrderIdAtom, setOrderStatesAtom } from "@/store/order.store"
import { useLazyQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const OrderDetail = ({ children }: { children: React.ReactNode }) => {
  const _id = useAtomValue(activeOrderIdAtom)
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const { onError } = useToast()

  const [getOrderDetail, { loading, data, refetch }] = useLazyQuery(
    queries.orderDetail,
    {
      fetchPolicy: "network-only",
      onError,
    }
  )

  useEffect(() => {
    if (data) {
      const { orderDetail } = data
      if (orderDetail?._id === _id) {
        setOrderStates(orderDetail)
      }
    }
  }, [_id, data, setOrderStates])

  useEffect(() => {
    !!_id && getOrderDetail({ variables: { _id } })
  }, [_id, getOrderDetail])

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const { message, fromPayment } = event.data
      if (fromPayment) {
        if (message === "paymentSuccessfull") {
          setTimeout(refetch, 30)
        }
      }
    })

    return removeEventListener("message", () => {})
  }, [])

  if (loading) return <Loader />

  return <>{children}</>
}

export default OrderDetail
