import { useEffect } from "react"
import { activeOrderAtom, setOrderStatesAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const OrderDetail = ({ children }: { children: React.ReactNode }) => {
  const _id = useAtomValue(activeOrderAtom)
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const { onError } = useToast()

  const { loading, data } = useQuery(queries.orderDetail, {
    fetchPolicy: "network-only",
    onError,
    skip: !_id,
    variables: { _id },
  })

  useEffect(() => {
    if (data) {
      const { orderDetail } = data
      if (orderDetail._id === _id) {
        setOrderStates(orderDetail)
      }
    }
  }, [_id, data, setOrderStates])

  if (loading) return <Loader />

  return <>{children}</>
}

export default OrderDetail
