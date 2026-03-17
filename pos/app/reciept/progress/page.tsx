"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { queries as productQueries } from "@/modules/products/graphql"
import {
  categoriesToPrintAtom,
  printOnlyNewItemsAtom,
  printSeparatelyAtom,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { useLazyQuery, useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import type { OrderItem } from "@/types/order.types"
import { ICategory, IProduct } from "@/types/product.types"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import { formatNum } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const filterProductsNeedProcess = (
  products: IProduct[],
  categoryOrders: string[]
) =>
  (products || [])
    .filter((product: IProduct) =>
      categoryOrders?.length > 0
        ? categoryOrders.some((order) =>
            product?.category?.order?.startsWith(order)
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
  const printSeparately = useAtomValue(printSeparatelyAtom)
  const { name } = useAtomValue(configAtom) || {}

  const [itemsToPrint, setItemsToPrint] = useState<OrderItem[][]>([])
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(
    null
  )
  const hasPrintedRef = useRef(false)

  const [getCategoryOrders, ordersQuery] = useLazyQuery(
    productQueries.getCategoryOrders,
    {
      onCompleted({ poscProducts }) {
        const allFilteredItems: OrderItem[][] = []

        for (const filterGroup of categoryOrders) {
          if (filterGroup.length === 0) continue

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
            ? baseItems.filter(
                (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
              )
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

      const baseItems = orderDetail.items || []

      const newItems = baseItems.filter(
        (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
      )

      if (!forCustomer && onlyNewItems && !newItems.length) {
        return handleAfterPrint()
      }

      const itemsToProcess = !forCustomer && onlyNewItems ? newItems : baseItems

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

  const { data: categoryData } = useQuery(productQueries.productCategories)

  const categories = categoryData?.poscProductCategories || []

  const findCategoryName = (order: string) => {
    const matched = categories
      .filter((cat: ICategory) => order.startsWith(cat.order))
      .sort((a: ICategory, b: ICategory) => b.order.length - a.order.length)

    return matched[0]?.name || ""
  }
  const groupTitles = useMemo(() => {
    return categoryOrders.map((group) =>
      group
        .map((g) => findCategoryName(g))
        .filter(Boolean)
        .join(", ")
    )
  }, [categoryOrders, categories])

  const { number, modifiedAt, items, description } = data?.orderDetail || {}

  const totalAmount = useMemo(() => {
    return (items || []).reduce(
      (sum: number, item: OrderItem) =>
        sum + (item.unitPrice || 0) * (item.count || 0),
      0
    )
  }, [items])

  const handleAfterPrint = useCallback(() => {
    window.parent.postMessage({ message: "close" }, "*")
  }, [])

  useEffect(() => {
    hasPrintedRef.current = false
  }, [slug])

  useEffect(() => {
    if (itemsToPrint.length === 0) return
    if (hasPrintedRef.current) return

    hasPrintedRef.current = true

    if (printSeparately && !forCustomer && itemsToPrint.length > 1) {
      let index = 0

      const printNext = () => {
        if (index >= itemsToPrint.length) {
          handleAfterPrint()
          return
        }

        setCurrentGroupIndex(index)

        setTimeout(() => {
          window.print()
          index++

          setTimeout(() => {
            printNext()
          }, 1000)
        }, 100)
      }

      printNext()
      return
    }

    setTimeout(() => window.print(), 100)
  }, [itemsToPrint, printSeparately, forCustomer, handleAfterPrint])

  const printItems = useMemo((): OrderItem[][] => {
    if (forCustomer) return [items || []]

    const hasFilters = categoryOrders.some((g) => g.length > 0)

    if (hasFilters) return itemsToPrint

    if (onlyNewItems) {
      return [
        (items || []).filter(
          (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
        ),
      ]
    }

    return [items || []]
  }, [forCustomer, onlyNewItems, categoryOrders, itemsToPrint, items])

  if (loading || ordersQuery.loading) return <div />

  const groups = printItems

  const renderGroups =
    printSeparately && currentGroupIndex !== null
      ? [{ items: groups[currentGroupIndex], index: currentGroupIndex }]
      : groups.map((g, i) => ({ items: g, index: i }))

  return (
    <div className="space-y-1 text-[12px]">
      {renderGroups.map(({ items: groupItems, index }, i) => (
        <div key={i}>
          {i > 0 && <div className="my-3 border-t border-dashed" />}

          <div className="flex justify-between items-center text-xs font-semibold">
            <div>
              <div>{name}</div>
              {!forCustomer && groupTitles[index] && (
                <div className="text-[10px] text-muted-foreground">
                  {groupTitles[index]}
                </div>
              )}
            </div>
            <span>#{(number || "").split("_")[1]}</span>
          </div>

          <div>
            Огноо:{" "}
            <span className="font-semibold">
              {modifiedAt &&
                format(new Date(modifiedAt), "yyyy.MM.dd HH:mm:ss")}
            </span>
          </div>

          <div className="flex items-center font-semibold">
            <span className="flex-auto">Бараа</span>
            <span>Т/Ш</span>
          </div>

          <Separator />

          {groupItems.map((item) => (
            <div className="flex items-center" key={item._id}>
              <span className="flex-auto">{item.productName}</span>
              <span>
                x{item.count}{" "}
                {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
              </span>
            </div>
          ))}

          {forCustomer && (
            <div className="flex justify-between items-center pt-1 mt-2 font-semibold border-t">
              <span>Нийт</span>
              <span>{formatNum(totalAmount)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Progress
