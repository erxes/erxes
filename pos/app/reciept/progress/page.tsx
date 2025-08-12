"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { queries as productQueries } from "@/modules/products/graphql"
import { categoriesToPrintAtom, printOnlyNewItemsAtom } from "@/store"
import { configAtom } from "@/store/config.store"
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
      categoryOrders?.length > 0
        ? categoryOrders.some((order) =>
            product?.category?.order?.includes(order)
          )
        : true
    )
    .map((product: IProduct) => product._id)

const Progress = () => {
  const searchParams = useSearchParams()
  const slug = searchParams.get("id")
  const id = slug?.split("?")[0]
  const forCustomer = slug?.split("?")[1] === "customer"
  const onlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const categoryOrders = useAtomValue(categoriesToPrintAtom)
  const [itemsToPrint, setItemsToPrint] = useState<OrderItem[][]>([])
  const { name } = useAtomValue(configAtom) || {}

  const [getCategoryOrders, ordersQuery] = useLazyQuery(
    productQueries.getCategoryOrders,
    {
      onCompleted({ poscProducts }) {
        const allFilteredItems: OrderItem[][] = []

        for (const filterGroup of categoryOrders) {
          if (filterGroup.length === 0) {
            continue
          }

          const productsNeedProcess = filterProductsNeedProcess(
            poscProducts,
            filterGroup
          )
          const baseItems = items || []
          const filteredByStatus = onlyNewItems
            ? baseItems.filter(
                (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
              )
            : baseItems
          const checkedItems = filteredByStatus.filter((item: OrderItem) =>
            productsNeedProcess.includes(item.productId)
          )

          if (checkedItems.length > 0) {
            allFilteredItems.push(checkedItems)
          }
        }

        
        if (allFilteredItems.length === 0) {
          const baseItems = items || []
          const itemsToProcess = onlyNewItems 
            ? baseItems.filter((item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE)
            : baseItems
          setItemsToPrint([itemsToProcess])
        } else {
          setItemsToPrint(allFilteredItems)
        }
      },
    }
  )

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    fetchPolicy: "network-only",
    onCompleted({ orderDetail }) {
      const hasFilters = categoryOrders.some((group) => group.length > 0)
      if (forCustomer) {
        return window.print()
      }
      if (!onlyNewItems && !hasFilters) {
        return window.print()
      }

      const newItems =
        orderDetail.items?.filter(
          (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
        ) || []
      if (onlyNewItems && !newItems.length) {
        return handleAfterPrint()
      }

      const itemsToProcess = onlyNewItems ? newItems : orderDetail.items || []
      if (hasFilters) {
        return getCategoryOrders({
          variables: {
            ids: itemsToProcess.map((item: OrderItem) => item.productId),
          },
        })
      }

      setItemsToPrint([itemsToProcess])
    },
  })

  const { number, modifiedAt, items, description } = data?.orderDetail || {}

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
      setTimeout(() => {
        window.print()
      }, 100)
    }
  }, [itemsToPrint])

  useEffect(() => {
    if (data?.orderDetail && !loading && !ordersQuery.loading) {
      const hasFilters = categoryOrders.some((group) => group.length > 0)
      if (!forCustomer && !hasFilters && !onlyNewItems && itemsToPrint.length === 0) {
        setTimeout(() => {
          window.print()
        }, 200)
      }
    }
  }, [data, loading, ordersQuery.loading, categoryOrders, forCustomer, onlyNewItems, itemsToPrint.length])

  const printItems = useMemo(() => {
    if (forCustomer) {
      return items
    }
    const hasFilters = categoryOrders.some((group) => group.length > 0)
    if (hasFilters) {
      return itemsToPrint
    }
    if (onlyNewItems) {
      return (
        items?.filter(
          (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
        ) || []
      )
    }
    return items || []
  }, [forCustomer, onlyNewItems, categoryOrders, itemsToPrint, items])

  if (loading || ordersQuery.loading) return <div />

  return (
    <div className="space-y-1 text-[12px]">
      <div className="flex items-center justify-between font-semibold text-xs">
        <span>{name}</span>
        <span>#{(number || "").split("_")[1]}</span>
      </div>
      <div>
        Огноо:{" "}
        <span className="font-semibold">
          {modifiedAt && format(new Date(modifiedAt), "yyyy.MM.dd HH:mm:ss")}
        </span>
      </div>
      <div>
        <div className="flex items-center font-semibold">
          <span className="flex-auto">Бараа</span>
          <span>Т/Ш</span>
          {forCustomer && <span className="w-1/4 text-right">Үнэ</span>}
        </div>
        <Separator />

        {(() => {
          if (forCustomer) {
            return (printItems as OrderItem[]).map((item: OrderItem) => (
              <div className="flex items-center" key={item._id}>
                <span className="flex-auto">{item.productName}</span>
                <span>
                  x{item.count}{" "}
                  {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
                </span>
                <span className="ml-1 w-1/4 text-right">
                  {(item.unitPrice * item.count).toLocaleString()}
                </span>
              </div>
            ))
          }

          const hasMultipleGroups =
            Array.isArray(printItems) &&
            printItems.length > 0 &&
            Array.isArray(printItems[0])

          if (hasMultipleGroups) {
            return (printItems as OrderItem[][]).map(
              (groupItems: OrderItem[], groupIndex: number) => (
                <div key={`filter-group-${groupIndex}`}>
                  {groupIndex > 0 && (
                    <div className="my-3 border-t border-dashed" />
                  )}
                  {groupItems.map((item: OrderItem) => (
                    <div className="flex items-center" key={item._id}>
                      <span className="flex-auto">{item.productName}</span>
                      <span>
                        x{item.count}{" "}
                        {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )
          }

          return (printItems as OrderItem[]).map((item: OrderItem) => (
            <div className="flex items-center" key={item._id}>
              <span className="flex-auto">{item.productName}</span>
              <span>
                x{item.count}{" "}
                {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
              </span>
            </div>
          ))
        })()}
      </div>
      {!!description && (
        <div>
          <div className="font-semibold">Хүргэлтын мэдээлэл:</div>
          <div>{description}</div>
        </div>
      )}
      {forCustomer && (
        <>
          <Separator />
          <div className="text-right">
            <span>Нийт: </span>
            <span className="font-semibold">
              {(items || [])
                .reduce(
                  (acc: number, item: OrderItem) =>
                    acc + item.unitPrice * item.count,
                  0
                )
                .toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default Progress
