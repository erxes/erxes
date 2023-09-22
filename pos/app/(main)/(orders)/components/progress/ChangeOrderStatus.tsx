import { useEffect, useMemo } from "react"
import { mutations } from "@/modules/orders/graphql"
import { showRecieptAtom } from "@/store/progress.store"
import { useMutation } from "@apollo/client"
import { useSetAtom } from "jotai"
import { CheckIcon } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

const ChangeOrderStatus = ({
  _id,
  items,
  status,
}: {
  _id: string
  items: OrderItem[]
  status?: string
}) => {
  const setShowReciept = useSetAtom(showRecieptAtom)

  const [orderChangeStatus, { loading }] = useMutation(
    mutations.orderChangeStatus,
    {
      onCompleted(data) {
        const { orderChangeStatus } = data
        orderChangeStatus.status === ORDER_STATUSES.DONE && setShowReciept(_id)
      },
    }
  )

  const handleChangeStatus = (status: string) =>
    orderChangeStatus({
      variables: {
        _id,
        status,
      },
    })

  const memorisedValue = useMemo<OrderItem[]>(() => items, [items])

  useEffect(() => {
    const doneItems = items.filter(
      (item) => item.status === ORDER_STATUSES.DONE
    )
    if (doneItems.length > 0 && status !== ORDER_STATUSES.DOING)
      handleChangeStatus(ORDER_STATUSES.DOING)

    if (doneItems.length === items.length)
      handleChangeStatus(ORDER_STATUSES.DONE)
  }, [memorisedValue])

  return (
    <>
      <Button
        className="font-medium"
        size="sm"
        variant="secondary"
        loading={loading}
        onClick={() => handleChangeStatus(ORDER_STATUSES.DONE)}
      >
        {!loading && <CheckIcon className="h-5 w-5 mr-1" strokeWidth={1.5} />}
        Бэлэн болсон
      </Button>
    </>
  )
}

export default ChangeOrderStatus
