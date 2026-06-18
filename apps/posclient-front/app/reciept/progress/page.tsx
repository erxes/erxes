"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { queries as productQueries } from "@/modules/products/graphql"
import {
  categoriesToPrintAtom,
  printOnlyNewItemsAtom,
  printSeparatelyAtom,
  qzCategoryPrintersAtom,
  qzMainPrinterAtom,
  qzTrayEnabledAtom,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { useLazyQuery, useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import type { OrderItem } from "@/types/order.types"
import { ICategory } from "@/types/product.types"
import { captureDocumentHtml } from "@/lib/captureHtml"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import {
  ensureQzConnected,
  printHtmlToPrinter,
  QZ_TRAY_NOT_RUNNING_MESSAGE,
} from "@/lib/qzTray"
import { formatNum } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { onError } from "@/components/ui/use-toast"

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

type PrintOptions = {
  closeAfterPrint?: boolean
  onPrinted?: () => void
}

type ReceiptPrintGroup = {
  items: OrderItem[]
  title: string
}

const BROWSER_PRINT_DELAY_MS = 100
const QZ_CUSTOMER_PRINT_DELAY_MS = 50
const QZ_GROUP_PRINT_DELAY_MS = 200
const SEPARATE_PRINT_DELAY_MS = 800

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs)
  })

const hasCategoryFilters = (forCustomer: boolean, categoryOrders: string[][]) =>
  !forCustomer && categoryOrders.some((group) => group.length > 0)

const getNonEmptyGroupIndexes = (groups: OrderItem[][]) =>
  groups.reduce<number[]>((indexes, group, index) => {
    if (group.length > 0) {
      indexes.push(index)
    }

    return indexes
  }, [])

const buildRenderGroups = ({
  forCustomer,
  items,
  itemsToPrint,
  printSeparately,
  qzEnabled,
  currentGroupIndex,
  groupTitles,
}: {
  forCustomer: boolean
  items?: OrderItem[]
  itemsToPrint: OrderItem[][]
  printSeparately: boolean
  qzEnabled: boolean
  currentGroupIndex: number | null
  groupTitles: string[]
}): ReceiptPrintGroup[] => {
  if (forCustomer) {
    return [{ items: items || [], title: "" }]
  }

  if ((printSeparately || qzEnabled) && currentGroupIndex !== null) {
    return [
      {
        items: itemsToPrint[currentGroupIndex] || [],
        title: groupTitles[currentGroupIndex],
      },
    ]
  }

  return itemsToPrint
    .map((group, index) => ({
      items: group,
      title: groupTitles[index],
    }))
    .filter((group) => group.items.length > 0)
}

const getRenderGroupKey = (group: ReceiptPrintGroup) => {
  const itemIds = group.items.map((item) => item._id).join("|")

  return `${group.title || "customer"}-${itemIds || "empty"}`
}

const Progress = () => {
  const searchParams = useSearchParams()
  const slug = searchParams.get("id")
  const id = slug?.split("?")[0]
  const forCustomer = slug?.split("?")[1] === "customer"

  const onlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const categoryOrders = useAtomValue(categoriesToPrintAtom)
  const printSeparately = useAtomValue(printSeparatelyAtom)
  const qzEnabled = useAtomValue(qzTrayEnabledAtom)
  const qzMainPrinter = useAtomValue(qzMainPrinterAtom)
  const qzCategoryPrinters = useAtomValue(qzCategoryPrintersAtom)
  const { name } = useAtomValue(configAtom) || {}

  const [itemsToPrint, setItemsToPrint] = useState<OrderItem[][]>([])
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(
    null
  )
  const [isCategoryLoaded, setIsCategoryLoaded] = useState(false)

  const hasPrintedRef = useRef(false)
  const latestItemsRef = useRef<OrderItem[]>([])
  const nextQzGroupPositionRef = useRef(0)

  const setGroupedItems = useCallback((groupedItems: OrderItem[][]) => {
    nextQzGroupPositionRef.current = 0
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
    globalThis.window.parent.postMessage({ message: "close" }, "*")
  }, [])

  const triggerPrint = useCallback(
    (options?: PrintOptions) => {
      setTimeout(() => {
        globalThis.window.print()
        options?.onPrinted?.()

        if (options?.closeAfterPrint) {
          handleAfterPrint()
        }
      }, BROWSER_PRINT_DELAY_MS)
    },
    [handleAfterPrint]
  )

  const printViaQz = useCallback(async (printerName: string) => {
    const html = await captureDocumentHtml()
    await printHtmlToPrinter(printerName, html)
  }, [])

  const markPrinted = useCallback(() => {
    if (hasPrintedRef.current) return false

    hasPrintedRef.current = true
    return true
  }, [])

  const allowPrintRetry = useCallback(() => {
    hasPrintedRef.current = false
  }, [])

  const printWithQz = useCallback(
    async (printerName: string, delayMs: number) => {
      const ok = await ensureQzConnected()

      if (!ok) {
        onError(QZ_TRAY_NOT_RUNNING_MESSAGE)
        return false
      }

      try {
        await wait(delayMs)
        await printViaQz(printerName)
        return true
      } catch {
        onError(QZ_TRAY_NOT_RUNNING_MESSAGE)
        return false
      }
    },
    [printViaQz]
  )

  const printCustomerReceipt = useCallback(() => {
    if (!qzEnabled) {
      triggerPrint({ closeAfterPrint: true })
      return
    }

    if (!qzMainPrinter) {
      onError("Үндсэн принтер сонгогдоогүй байна")
      allowPrintRetry()
      return
    }

    void (async () => {
      const printed = await printWithQz(
        qzMainPrinter,
        QZ_CUSTOMER_PRINT_DELAY_MS
      )

      if (printed) {
        nextQzGroupPositionRef.current = 0
        handleAfterPrint()
        return
      }

      allowPrintRetry()
    })()
  }, [
    allowPrintRetry,
    handleAfterPrint,
    printWithQz,
    qzEnabled,
    qzMainPrinter,
    triggerPrint,
  ])

  const printQzGroups = useCallback(
    (nonEmptyIndexes: number[]) => {
      const completedPosition = nextQzGroupPositionRef.current
      const remainingIndexes = nonEmptyIndexes.slice(completedPosition)

      if (remainingIndexes.length === 0) {
        nextQzGroupPositionRef.current = 0
        handleAfterPrint()
        return
      }

      const missingPrinter = remainingIndexes.find(
        (index) => !(qzCategoryPrinters[index] || "").trim()
      )

      if (missingPrinter !== undefined) {
        onError("Принтер сонгогдоогүй байна")
        allowPrintRetry()
        return
      }

      void (async () => {
        const ok = await ensureQzConnected()

        if (!ok) {
          onError(QZ_TRAY_NOT_RUNNING_MESSAGE)
          allowPrintRetry()
          return
        }

        try {
          for (let offset = 0; offset < remainingIndexes.length; offset++) {
            const index = remainingIndexes[offset]
            setCurrentGroupIndex(index)
            await wait(QZ_GROUP_PRINT_DELAY_MS)
            await printViaQz(qzCategoryPrinters[index])
            nextQzGroupPositionRef.current = completedPosition + offset + 1
          }

          nextQzGroupPositionRef.current = 0
          handleAfterPrint()
        } catch {
          onError(QZ_TRAY_NOT_RUNNING_MESSAGE)
          allowPrintRetry()
        }
      })()
    },
    [allowPrintRetry, handleAfterPrint, printViaQz, qzCategoryPrinters]
  )

  const printKitchenWithMainPrinter = useCallback(() => {
    if (!qzMainPrinter) {
      onError("Үндсэн принтер сонгогдоогүй байна")
      allowPrintRetry()
      return
    }

    void (async () => {
      const printed = await printWithQz(qzMainPrinter, QZ_GROUP_PRINT_DELAY_MS)

      if (printed) {
        nextQzGroupPositionRef.current = 0
        handleAfterPrint()
        return
      }

      allowPrintRetry()
    })()
  }, [allowPrintRetry, handleAfterPrint, printWithQz, qzMainPrinter])

  const hasCategoryPrintGroups = useCallback(
    (nonEmptyIndexes: number[]) =>
      hasCategoryFilters(forCustomer, categoryOrders) &&
      nonEmptyIndexes.some((index) => (qzCategoryPrinters[index] || "").trim()),
    [categoryOrders, forCustomer, qzCategoryPrinters]
  )

  const printSeparateGroups = useCallback(() => {
    let index = 0

    const printNext = () => {
      while (index < itemsToPrint.length && itemsToPrint[index].length === 0) {
        index++
      }

      if (index >= itemsToPrint.length) {
        handleAfterPrint()
        return
      }

      const currentIndex = index
      setCurrentGroupIndex(currentIndex)

      triggerPrint({
        onPrinted: () => {
          index = currentIndex + 1
          setTimeout(printNext, SEPARATE_PRINT_DELAY_MS)
        },
      })
    }

    printNext()
  }, [handleAfterPrint, itemsToPrint, triggerPrint])

  const printKitchenReceipts = useCallback(() => {
    if (qzEnabled) {
      const nonEmptyIndexes = getNonEmptyGroupIndexes(itemsToPrint)

      if (hasCategoryPrintGroups(nonEmptyIndexes)) {
        printQzGroups(nonEmptyIndexes)
        return
      }

      printKitchenWithMainPrinter()
      return
    }

    if (printSeparately && itemsToPrint.length > 1) {
      printSeparateGroups()
      return
    }

    triggerPrint({ closeAfterPrint: true })
  }, [
    hasCategoryPrintGroups,
    itemsToPrint,
    printKitchenWithMainPrinter,
    printQzGroups,
    printSeparateGroups,
    printSeparately,
    qzEnabled,
    triggerPrint,
  ])

  useEffect(() => {
    if (loading) return

    if (hasCategoryFilters(forCustomer, categoryOrders) && !isCategoryLoaded) {
      return
    }

    if (forCustomer) {
      if (!items || items.length === 0) {
        handleAfterPrint()
        return
      }

      if (markPrinted()) {
        printCustomerReceipt()
      }

      return
    }

    if (!itemsToPrint.length) return

    const hasAnyItems = itemsToPrint.some((g) => g.length > 0)
    if (!hasAnyItems) {
      handleAfterPrint()
      return
    }

    if (markPrinted()) {
      printKitchenReceipts()
    }
  }, [
    itemsToPrint,
    isCategoryLoaded,
    forCustomer,
    items,
    loading,
    categoryOrders,
    handleAfterPrint,
    markPrinted,
    printCustomerReceipt,
    printKitchenReceipts,
  ])

  if (loading) return <div />

  const renderGroups = buildRenderGroups({
    forCustomer,
    items,
    itemsToPrint,
    printSeparately,
    qzEnabled,
    currentGroupIndex,
    groupTitles,
  })

  return (
    <div className="receipt-print space-y-2 text-[11px]">
      {renderGroups.map(({ items: groupItems, title }, i) => (
        <div key={getRenderGroupKey({ items: groupItems, title })}>
          {i > 0 && (
            <div className="my-3 border-t border-dashed border-black/20" />
          )}

          <div className="receipt-print__header receipt-print__row flex justify-between border-b border-black/15">
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
                <span className="receipt-print__qty tabular-nums font-semibold">
                  x{item.count}
                </span>
              </div>
            ))}
          </div>

          {forCustomer && (
            <div className="receipt-print__section receipt-print__row flex justify-between font-semibold">
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
