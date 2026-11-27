import { useCallback, useEffect } from "react"
import useChangeOrderStatus from "@/modules/orders/hooks/useChangeOrderStatus"
import { showRecieptAtom } from "@/store/progress.store"
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

  const { changeStatus, loading } = useChangeOrderStatus()

  const handleChangeStatus = useCallback(
    (status: string) =>
      changeStatus({
        variables: {
          _id,
          status,
        },
        onCompleted(data) {
          const { orderChangeStatus } = data
          orderChangeStatus.status === ORDER_STATUSES.DONE &&
            setShowReciept(_id)
        },
      }),
    [_id, changeStatus, setShowReciept]
  )

  const totalCount = items.length
  const doneCount = items.filter(
    (item) => item.status === ORDER_STATUSES.DONE
  ).length

  useEffect(() => {
    if (
      loading ||
      status === ORDER_STATUSES.DONE ||
      status === ORDER_STATUSES.COMPLETE
    ) {
      return
    }

    if (doneCount === totalCount) {
      handleChangeStatus(ORDER_STATUSES.DONE)
      return
    }

    if (doneCount > 0 && status !== ORDER_STATUSES.DOING) {
      handleChangeStatus(ORDER_STATUSES.DOING)
    }
  }, [doneCount, handleChangeStatus, loading, status, totalCount])

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
