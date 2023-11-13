import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useScheduleMutation } from "@/modules/timeclock/hooks/useScheduleMutation"
import {
  IScheduleConfig,
  IScheduleConfigOrder,
} from "@/modules/timeclock/types"
import { useAtomValue } from "jotai"
import { ChevronDown, ChevronUp, Pin } from "lucide-react"

type Props = {
  scheduleConfigsOrderData: any
  setScheduleConfigsOrderData: (data: any) => void
}

const ScheduleConfigOrder = ({
  scheduleConfigsOrderData,
  setScheduleConfigsOrderData,
}: Props) => {
  const [toggleOrder, setToggleOrder] = useState(false)
  const callBack = (result: string) => {
    return result
  }

  const { scheduleConfigOrderEdit } = useScheduleMutation({ callBack })

  const omitTypeName = (scheduleConfigOrderData: IScheduleConfigOrder) => {
    const orderData = scheduleConfigOrderData

    return {
      userId: orderData.userId,
      orderedList: orderData.orderedList.map((s) => ({
        order: s.order,
        scheduleConfigId: s.scheduleConfigId,
        pinned: s.pinned,
        label: s.label,
      })),
    }
  }

  const scheduleConfigOrderDataEdit = (scheduleConfigOrderData: any) => {
    setScheduleConfigsOrderData(scheduleConfigOrderData)
    scheduleConfigOrderEdit(omitTypeName(scheduleConfigOrderData))
  }

  const unpinScheduleConfig = (currentConfigOrder: number) => {
    let firstUnpinnedOrderNum = scheduleConfigsOrderData.orderedList.length

    const newScheduleConfigsOrderData = scheduleConfigsOrderData

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (!scheduleConfigsOrderItem.pinned) {
        firstUnpinnedOrderNum = scheduleConfigsOrderItem.order
        break
      }
    }

    const lastPinnedOrderNum = firstUnpinnedOrderNum - 1

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (scheduleConfigsOrderItem.order < currentConfigOrder) {
        continue
      }

      if (scheduleConfigsOrderItem.order > lastPinnedOrderNum) {
        break
      }

      if (scheduleConfigsOrderItem.order === currentConfigOrder) {
        scheduleConfigsOrderItem.order = lastPinnedOrderNum
        scheduleConfigsOrderItem.pinned = false
        continue
      }
      scheduleConfigsOrderItem.order = scheduleConfigsOrderItem.order - 1
    }

    scheduleConfigOrderDataEdit({ ...newScheduleConfigsOrderData })
  }

  const pinScheduleConfig = (currentConfigOrder: number) => {
    let firstUnpinnedOrderNum = 0

    const newScheduleConfigsOrderData = scheduleConfigsOrderData

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (!scheduleConfigsOrderItem.pinned) {
        firstUnpinnedOrderNum = scheduleConfigsOrderItem.order
        break
      }
    }

    const lastPinnedOrderNum = firstUnpinnedOrderNum - 1

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (scheduleConfigsOrderItem.order > currentConfigOrder) {
        break
      }

      if (scheduleConfigsOrderItem.order <= lastPinnedOrderNum) {
        continue
      }

      if (scheduleConfigsOrderItem.order === currentConfigOrder) {
        scheduleConfigsOrderItem.order = firstUnpinnedOrderNum
        scheduleConfigsOrderItem.pinned = true
        continue
      }
      scheduleConfigsOrderItem.order = scheduleConfigsOrderItem.order + 1
    }

    scheduleConfigOrderDataEdit({ ...newScheduleConfigsOrderData })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setToggleOrder(!toggleOrder)}
        className="flex gap-2 items-center"
      >
        <div className="flex gap-2 items-center">
          Select schedule configs order
          {toggleOrder ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {toggleOrder && (
        <div className="flex flex-col gap-2 px-3">
          {scheduleConfigsOrderData.orderedList
            .sort((a: any, b: any) => a.order - b.order)
            .map((s: any) => (
              <div
                key={s.order}
                className="flex justify-between items-center py-2 px-3 bg"
              >
                <div>{s.label}</div>
                {s.pinned ? (
                  <Pin
                    fill="purple"
                    color="purple"
                    onClick={() => unpinScheduleConfig(s.order)}
                    size={16}
                  />
                ) : (
                  <Pin onClick={() => pinScheduleConfig(s.order)} size={16} />
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default ScheduleConfigOrder
