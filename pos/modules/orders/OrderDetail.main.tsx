import { useEffect } from "react"
import { setOrderStatesAtom } from "@/store/order.store"
import { OperationVariables } from "@apollo/client"
import { useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"

import useOrderDetail from "./hooks/useOrderDetail"

const OrderDetail = ({
  children,
  variables,
}: {
  children: any
  variables?: OperationVariables
}) => {
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const { loading, orderDetail } = useOrderDetail({
    variables: variables,
    onCompleted: () => null,
  })

  useEffect(() => {
    orderDetail && setOrderStates(orderDetail)
  }, [orderDetail, setOrderStates])

  if (loading) return <Loader />
  return children
}

export default OrderDetail
