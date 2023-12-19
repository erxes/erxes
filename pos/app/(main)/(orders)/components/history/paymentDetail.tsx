import { queries } from "@/modules/orders/graphql"
import { paymentDetailAtom } from "@/store/history.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { OrderCancelTrigger } from "./orderCancel"
import { OrderReturnTrigger } from "./orderReturn"

const PaymentDetail = ({
  _id,
  paidDate,
}: {
  _id: string
  paidDate: string | null
}) => {
  const setPaymentDetail = useSetAtom(paymentDetailAtom)

  const { loading } = useQuery(queries.historyItemDetail, {
    variables: {
      _id,
    },
    onCompleted(data) {
      const { orderDetail } = data || {}
      setPaymentDetail(orderDetail || {})
    },
  })

  return (
    <>
      <OrderReturnTrigger _id={_id} paidDate={paidDate} />
      <OrderCancelTrigger loading={loading} _id={_id} />
    </>
  )
}

export default PaymentDetail
