"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { queries as productQueries } from "@/modules/products/graphql"
import { categoriesToPrintAtom, printOnlyNewItemsAtom } from "@/store"
import { useLazyQuery, useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import type { OrderItem } from "@/types/order.types"
import { IProduct } from "@/types/product.types"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"

const Progress = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const onlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const categoryOrders = useAtomValue(categoriesToPrintAtom)
  const [itemsToPrint, setNewItems] = useState([])
  const [getCategoryOrders, ordersQuery] = useLazyQuery(
    productQueries.getCategoryOrders,
    {}
  )

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    onCompleted({ orderDetail }) {
      const newItems = orderDetail.items?.filter(
        (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
      )

      if (onlyNewItems && !newItems.length) {
        return handleAfterPrint()
      }

      if (categoryOrders.length) {
        return getCategoryOrders({
          variables: { ids: newItems.map((it: OrderItem) => it.productId) },
          onCompleted({ poscProducts }) {
            const productsNeedProcess = (poscProducts || [])
              .filter((product: IProduct) => {
                let included = false
                ;(categoryOrders || []).forEach((order) => {
                  if (product?.category?.order?.includes(order)) {
                    included = true
                  }
                })
                return included
              })
              .map((product: IProduct) => product._id)

            const newItems = items.filter(
              (item: OrderItem) =>
                item.status !== ORDER_ITEM_STATUSES.DONE &&
                productsNeedProcess.includes(item.productId)
            )
            setNewItems(newItems)
            newItems.length > 0
              ? setTimeout(() => window.print())
              : handleAfterPrint()
          },
        })
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

  if (loading || ordersQuery.loading) return <div />

  const { number, modifiedAt, items, description } = data?.orderDetail || {}

  return (
    <div className="space-y-1 text-[13px]">
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
        {itemsToPrint.map((item: OrderItem) => (
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
