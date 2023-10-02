import { useEffect } from "react"
import { activeOrderAtom, setOrderStatesAtom } from "@/store/order.store"
import { DocumentNode, OperationVariables, useLazyQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import { IOrder } from "@/types/order.types"

import { queries } from "../graphql"

const useOrderDetail = (args?: {
  query?: DocumentNode
  onCompleted?: (data: any) => void
  skip?: boolean
  variables?: OperationVariables
}): {
  loading: boolean
  orderDetail?: IOrder
} => {
  const { query, onCompleted, skip, variables } = args || {}

  const [activeOrderId] = useAtom(activeOrderAtom)
  const setOrderStates = useSetAtom(setOrderStatesAtom)

  const [getOrderDetail, { data, loading }] = useLazyQuery(
    query || queries.orderDetail,
    {
      fetchPolicy: "network-only",
      onCompleted(data: { orderDetail?: IOrder }) {
        const { orderDetail } = data || {}
        if (!query && !onCompleted) {
          return !!orderDetail && setOrderStates(orderDetail)
        }
        if (!!onCompleted) return onCompleted(orderDetail)
      },
    }
  )

  useEffect(() => {
    if ((!!activeOrderId || !!variables) && !skip) {
      getOrderDetail({
        variables: variables || { _id: activeOrderId },
      })
    }
  }, [activeOrderId, getOrderDetail, skip, variables])

  const { orderDetail } = data || {}
  return { loading, orderDetail }
}

export default useOrderDetail
