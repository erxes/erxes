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

  const setGroupedItems = useCallback((groupedItems: OrderItem[][]) => {
    setCurrentGroupIndex(null)
    setItemsToPrint(groupedItems)
    setIsCategoryLoaded(true)
  }, [])

  const setUngroupedItems = useCallback(
    (baseItems: OrderItem[]) => {
      setGroupedItems([baseItems])
    },
    [setGroupedItems]
  )

  const [getCategoryOrders] = useLazyQuery<
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

      setGroupedItems(allFilteredItems)
    },
    onError() {
      setUngroupedItems(latestItemsRef.current || [])
    },
  })

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    fetchPolicy: "network-only",
    onCompleted({ orderDetail }) {
      setIsCategoryLoaded(false)
      setCurrentGroupIndex(null)

      const hasFilters =
        !forCustomer && categoryOrders.some((g) => g.length > 0)

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

      setUngroupedItems(itemsToProcess)
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
  const normalizedSlotCode = `${slotCode || ""}`.trim()

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

  const triggerPrint = useCallback(
    (options?: { closeAfterPrint?: boolean; onPrinted?: () => void }) => {
      setTimeout(() => {
        window.print()
        options?.onPrinted?.()

        if (options?.closeAfterPrint) {
          handleAfterPrint()
        }
      }, 100)
    },
    [handleAfterPrint]
  )

  useEffect(() => {
    if (loading) return

    const hasFilters = !forCustomer && categoryOrders.some((g) => g.length > 0)
    if (hasFilters && !isCategoryLoaded) return

    if (forCustomer) {
      if (!items || items.length === 0) {
        handleAfterPrint()
        return
      }

      if (hasPrintedRef.current) return
      hasPrintedRef.current = true

      triggerPrint({ closeAfterPrint: true })
      return
    }

    if (!itemsToPrint.length) return

    const hasAnyItems = itemsToPrint.some((g) => g.length > 0)
    if (!hasAnyItems) {
      handleAfterPrint()
      return
    }

    if (hasPrintedRef.current) return
    hasPrintedRef.current = true

    if (printSeparately && itemsToPrint.length > 1) {
      let index = 0
      const printNext: () => void = () => {
        if (index >= itemsToPrint.length) {
          handleAfterPrint()
          return
        }

        if (itemsToPrint[index].length === 0) {
          index++
          return printNext()
        }

        setCurrentGroupIndex(index)

        triggerPrint({
          onPrinted: () => {
            index++
            setTimeout(printNext, 800)
          },
        })
      }

      printNext()
      return
    }

    triggerPrint({ closeAfterPrint: true })
  }, [
    itemsToPrint,
    isCategoryLoaded,
    printSeparately,
    forCustomer,
    items,
    loading,
    categoryOrders,
    handleAfterPrint,
    triggerPrint,
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
    <div className="receipt-print space-y-2 text-[11px]">
      {renderGroups.map(({ items: groupItems, title }, i) => (
        <div key={i}>
          {i > 0 && (
            <div className="my-3 border-t border-dashed border-black/20" />
          )}

          <div className="flex justify-between border-b receipt-print__header receipt-print__row border-black/15">
            <div className="receipt-print__header-content">
              <div className="receipt-print__title">{name}</div>
              {!forCustomer && title && (
                <div className="receipt-print__subtitle">{title}</div>
              )}
            </div>
            <span className="font-semibold tabular-nums">
              #{(number || "").split("_")[1]}
            </span>
          </div>

          <div className="receipt-print__meta-block">
            <div className="receipt-print__row receipt-print__meta-row">
              <span className="receipt-print__meta-label">Огноо:</span>
              <span className="receipt-print__meta-value tabular-nums">
                {modifiedAt &&
                  format(new Date(modifiedAt), "yyyy.MM.dd HH:mm:ss")}
              </span>
            </div>

            {!!normalizedSlotCode && (
              <div className="receipt-print__row receipt-print__meta-row">
                <span className="receipt-print__meta-label">Ширээ:</span>
                <span className="receipt-print__meta-value tabular-nums">
                  {normalizedSlotCode}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-black/15" />

          <div className="receipt-print__items">
            {groupItems.map((item: OrderItem) => (
              <div
                key={item._id}
                className="receipt-print__row receipt-print__item"
              >
                <span>{item.productName}</span>
                <span className="font-semibold receipt-print__qty tabular-nums">
                  x{item.count}
                </span>
              </div>
            ))}
          </div>

          {forCustomer && (
            <div className="flex justify-between font-semibold receipt-print__section receipt-print__row">
              <span>Нийт</span>
              <span className="tabular-nums">{formatNum(totalAmount)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Progress
