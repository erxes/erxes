"use client"

import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { printOnlyNewItemsAtom } from "@/store"
import { useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import type { OrderItem } from "@/types/order.types"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"

const Progress = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const onlyNewItems = useAtomValue(printOnlyNewItemsAtom)

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    onCompleted({ orderDetail }) {
      const newItems = orderDetail.items?.filter(
        (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
      )
      if (onlyNewItems && !newItems.length) {
        return handleAfterPrint()
      }

      return setTimeout(() => window.print())
    },
  })

  const handleAfterPrint = useCallback(() => {
    const data = { message: "close" }
    window.parent.postMessage(data, "*")
  }, [])
  useEffect(() => {
    window.addEventListener("afterprint", handleAfterPrint)
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [handleAfterPrint])

  if (loading) return <div />

  const { number, modifiedAt, items, description } = data?.orderDetail || {}

  const newItems = items.filter(
    (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
  )

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between font-semibold text-xs">
        <span className="">Erxes pos</span>
        <span>#{(number || "").split("_")[1]}</span>
      </div>
      <div>
        Огноо:{" "}
        <span className="font-semibold">
          {modifiedAt && format(new Date(modifiedAt), "yyyy.MM.dd HH:mm:ss")}
        </span>
      </div>
      <div>
        <div className="flex items-center justify-between font-semibold">
          <span>Бараа</span>
          <span>Т/Ш</span>
        </div>
        <Separator />
        {newItems.map((item: OrderItem) => (
          <div className="flex items-center justify-between" key={item._id}>
            <span>{item.productName}</span>
            <span>
              x{item.count}{" "}
              {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
            </span>
          </div>
        ))}
      </div>
      {!!description && (
        <div>
          <div className="font-semibold">Хүргэлтын мэдээлэл:</div>
          <div>{description}</div>
        </div>
      )}
    </div>
  )
}

export default Progress
