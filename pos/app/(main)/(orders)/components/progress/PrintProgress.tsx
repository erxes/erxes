import { useState, useEffect } from "react"
import useChangeOrderStatus from "@/modules/orders/hooks/useChangeOrderStatus"
import { printOnlyNewItemsAtom, printConfigurationsAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { showRecieptAtom } from "@/store/progress.store"
import { useAtom, useAtomValue } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import useReciept from "@/lib/useReciept"

const PrintProgress = () => {
  const [showRecieptId, setShowRecieptId] = useAtom(showRecieptAtom)
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const printOnlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const printConfigurations = useAtomValue(printConfigurationsAtom)
  const { changeStatus } = useChangeOrderStatus()
  
  const enabledConfigs = printConfigurations.filter(config => config.enabled)
  
  const { iframeRef } = useReciept({
    onCompleted() {
      if (enabledConfigs.length > 1 && currentConfigIndex < enabledConfigs.length - 1) {
        setTimeout(() => {
          setCurrentConfigIndex(prev => prev + 1)
        }, 500) 
        return
      }
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
      setCurrentConfigIndex(0)
    },
  })

  useEffect(() => {
    if (showRecieptId) {
      setCurrentConfigIndex(0)
    }
  }, [showRecieptId])

  const getCurrentConfigParam = () => {
    if (!enabledConfigs.length) return ""
    return `&config=${enabledConfigs[currentConfigIndex]?.id || enabledConfigs[0]?.id}`
  }

  return (
    <>
      {!!showRecieptId && (
        <iframe
          ref={iframeRef}
          className="absolute h-1 w-1"
          style={{ top: 10000, left: 10000 }}
          src={`/reciept/progress?id=${showRecieptId}${getCurrentConfigParam()}`}
        />
      )}
    </>
  )
}

export default PrintProgress
