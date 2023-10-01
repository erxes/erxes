import { useEffect } from "react"
import { activeOrderAtom, setOrderStatesAtom } from "@/store/order.store"
import { useLazyQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const OrderDetail = ({ children }: { children: React.ReactNode }) => {
  const _id = useAtomValue(activeOrderAtom)
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const { onError } = useToast()

  const [getOrderDetail, { loading, data }] = useLazyQuery(
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
    getOrderDetail({ variables: { _id } })
  }, [_id, getOrderDetail])

  if (loading) return <Loader />

  return <>{children}</>
}

export default OrderDetail
