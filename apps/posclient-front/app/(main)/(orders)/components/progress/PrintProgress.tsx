import useChangeOrderStatus from "@/modules/orders/hooks/useChangeOrderStatus"
import { printOnlyNewItemsAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { showRecieptAtom } from "@/store/progress.store"
import { useAtom, useAtomValue } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import useReciept from "@/lib/useReciept"

const PrintProgress = () => {
  const [showRecieptId, setShowRecieptId] = useAtom(showRecieptAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const printOnlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const { changeStatus } = useChangeOrderStatus()
  const { iframeRef } = useReciept({
    onCompleted() {
      if (!showRecieptId?.includes("customer") && printOnlyNewItems) {
        changeStatus({
          variables: {
            _id: activeOrderId,
            status: ORDER_STATUSES.DONE,
          },
          refetchQueries: ["orderDetail"],
        })
      }
      setShowRecieptId(null)
    },
  })
  return (
    <>
      {!!showRecieptId && (
        <iframe
          ref={iframeRef}
          className="absolute h-1 w-1"
          style={{ top: 10000, left: 10000 }}
          src={`/reciept/progress?id=${showRecieptId}`}
        />
      )}
    </>
  )
}

export default PrintProgress
