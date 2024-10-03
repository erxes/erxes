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

const filterProductsNeedProcess = (
  products: IProduct[],
  categoryOrders: string[]
) =>
  (products || [])
    .filter((product: IProduct) =>
      (categoryOrders || []).some((order) =>
        product?.category?.order?.includes(order)
      )
    )
    .map((product: IProduct) => product._id)

const Progress = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const onlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const categoryOrders = useAtomValue(categoriesToPrintAtom)
  const [itemsToPrint, setItemsToPrint] = useState<OrderItem[]>([])

  const [getCategoryOrders, ordersQuery] = useLazyQuery(
    productQueries.getCategoryOrders,
    {
      onCompleted({ poscProducts }) {
        const productsNeedProcess = filterProductsNeedProcess(
          poscProducts,
          categoryOrders
        )

        const itemsShouldPrint = itemsToPrint.filter((item: OrderItem) =>
          productsNeedProcess.includes(item.productId)
        )

        setItemsToPrint(itemsShouldPrint)
      },
    }
  )

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    onCompleted({ orderDetail }) {
      if (!onlyNewItems && !categoryOrders.length) {
        return setTimeout(() => window.print(), 0)
      }

      const newItems =
        orderDetail.items?.filter(
          (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
        ) || []

      if (onlyNewItems && !newItems.length) {
        return handleAfterPrint()
      }

      const itemsToProcess = onlyNewItems ? newItems : orderDetail.items || []

      if (categoryOrders.length) {
        return getCategoryOrders({
          variables: {
            ids: itemsToProcess.map((item: OrderItem) => item.productId),
          },
        })
      }

      setItemsToPrint(itemsToProcess)
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

  useEffect(() => {
    if (itemsToPrint.length > 0) {
      setTimeout(() => window.print(), 0)
    }
  }, [itemsToPrint])

  if (loading || ordersQuery.loading) return <div />

  const { number, modifiedAt, items, description } = data?.orderDetail || {}

  const printItems =
    onlyNewItems || categoryOrders.length ? itemsToPrint : items || []

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
        {printItems.map((item: OrderItem) => (
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
