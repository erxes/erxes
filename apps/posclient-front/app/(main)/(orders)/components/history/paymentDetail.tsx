import { HistoryOrderCancelTrigger } from "@/modules/orders/components/orderCancel"
import { queries } from "@/modules/orders/graphql"
import { paymentDetailAtom } from "@/store/history.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { OrderReturnTrigger } from "./orderReturn"

const PaymentDetail = ({
  _id,
  paidDate,
  onSelect,
}: {
  _id: string
  paidDate: string | null
  onSelect: () => void
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
      <OrderReturnTrigger _id={_id} paidDate={paidDate} onSelect={onSelect} />
      <HistoryOrderCancelTrigger
        loading={loading}
        _id={_id}
        onSelect={onSelect}
      />
    </>
  )
}

export default PaymentDetail
