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
import { ICategory } from "@/types/product.types"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import { formatNum } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

type CategoryOrdersByProductQueryResult = {
  poscProducts?: Array<{
    _id: string
    category?: {
      order?: string | null
    } | null
  } | null> | null
}

type CategoryOrdersByProductQueryVariables = {
  ids?: string[]
}

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
  const [isCategoryLoaded, setIsCategoryLoaded] = useState(false)

  const hasPrintedRef = useRef(false)
  const latestItemsRef = useRef<OrderItem[]>([])

  const [getCategoryOrders, ordersQuery] = useLazyQuery<
    CategoryOrdersByProductQueryResult,
    CategoryOrdersByProductQueryVariables
  >(productQueries.getCategoryOrders, {
    onCompleted({ poscProducts }) {
      const baseItems = latestItemsRef.current || []

      const filteredByStatus = onlyNewItems
        ? baseItems.filter((item) => item.status !== ORDER_ITEM_STATUSES.DONE)
        : baseItems

      const productMap = new Map(
        (poscProducts || []).filter(Boolean).map((p) => [p!._id, p!] as const)
      )

      const allFilteredItems: OrderItem[][] = []

      for (const filterGroup of categoryOrders) {
        const checkedItems = filteredByStatus.filter((item) => {
          const product = productMap.get(item.productId)
          const order = product?.category?.order || ""

          return filterGroup.some((o) => order.startsWith(o))
        })

        allFilteredItems.push(checkedItems)
      }

      setItemsToPrint(allFilteredItems)
      setIsCategoryLoaded(true)
    },
  })

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    fetchPolicy: "network-only",
    onCompleted({ orderDetail }) {
      setIsCategoryLoaded(false)

      const hasFilters = categoryOrders.some((g) => g.length > 0)

      const baseItems = orderDetail.items || []

      const newItems = baseItems.filter(
        (item: OrderItem) => item.status !== ORDER_ITEM_STATUSES.DONE
      )

      const itemsToProcess = !forCustomer && onlyNewItems ? newItems : baseItems

      latestItemsRef.current = itemsToProcess

      if (hasFilters) {
        return getCategoryOrders({
          variables: {
            ids: itemsToProcess.map((item: OrderItem) => item.productId),
          },
        })
      }

      setItemsToPrint([itemsToProcess])
      setIsCategoryLoaded(true)
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

  const { number, modifiedAt, items, slotCode } = data?.orderDetail || {}

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
    if (loading) return

    const hasFilters = categoryOrders.some((g) => g.length > 0)
    if (hasFilters && !isCategoryLoaded) return

    if (forCustomer) {
      if (!items || items.length === 0) return

      if (hasPrintedRef.current) return
      hasPrintedRef.current = true

      setTimeout(() => window.print(), 100)
      return
    }

    if (!itemsToPrint.length) return

    const hasAnyItems = itemsToPrint.some((g) => g.length > 0)
    if (!hasAnyItems) return

    if (hasPrintedRef.current) return
    hasPrintedRef.current = true

    if (printSeparately && itemsToPrint.length > 1) {
      let index = 0

      const printNext = () => {
        if (index >= itemsToPrint.length) {
          handleAfterPrint()
          return
        }

        if (itemsToPrint[index].length === 0) {
          index++
          return printNext()
        }

        setCurrentGroupIndex(index)

        setTimeout(() => {
          window.print()
          index++
          setTimeout(printNext, 800)
        }, 100)
      }

      printNext()
      return
    }

    setTimeout(() => window.print(), 100)
  }, [
    itemsToPrint,
    isCategoryLoaded,
    printSeparately,
    forCustomer,
    items,
    loading,
    categoryOrders,
  ])

  if (loading) return <div />

  const renderGroups = forCustomer
    ? [{ items: items || [], title: "" }]
    : printSeparately && currentGroupIndex !== null
    ? [
        {
          items: itemsToPrint[currentGroupIndex] || [],
          title: groupTitles[currentGroupIndex],
        },
      ]
    : itemsToPrint
        .map((g, i) => ({
          items: g,
          title: groupTitles[i],
        }))
        .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-1 text-[12px]">
      {renderGroups.map(({ items: groupItems, title }, i) => (
        <div key={i}>
          {i > 0 && <div className="my-3 border-t border-dashed" />}

          <div className="flex justify-between text-xs font-semibold">
            <div>
              <div>{name}</div>
              {!forCustomer && title && (
                <div className="text-[10px] text-muted-foreground">{title}</div>
              )}
            </div>
            <span>#{(number || "").split("_")[1]}</span>
          </div>

          <div className="flex justify-between">
            <span>Огноо:</span>
            <span>
              {modifiedAt &&
                format(new Date(modifiedAt), "yyyy.MM.dd HH:mm:ss")}
            </span>
          </div>

          {slotCode && (
            <div className="flex justify-between">
              <span>Ширээ:</span>
              <span>{slotCode}</span>
            </div>
          )}

          <Separator />

          {groupItems.map((item: OrderItem) => (
            <div key={item._id} className="flex justify-between">
              <span>{item.productName}</span>
              <span>x{item.count}</span>
            </div>
          ))}

          {forCustomer && (
            <div className="flex justify-between pt-1 mt-2 font-semibold border-t">
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
