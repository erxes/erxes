"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { queries as productQueries } from "@/modules/products/graphql"
import { categoriesToPrintAtom, printOnlyNewItemsAtom, printConfigurationsAtom } from "@/store"
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
  const configId = searchParams.get("config")
  const id = slug?.split("?")[0]
  const forCustomer = slug?.split("?")[1] === "customer"
  const onlyNewItems = useAtomValue(printOnlyNewItemsAtom)
  const categoryOrders = useAtomValue(categoriesToPrintAtom)
  const printConfigurations = useAtomValue(printConfigurationsAtom)
  const [itemsToPrint, setItemsToPrint] = useState<OrderItem[]>([])
  const [groupedItems, setGroupedItems] = useState<{[key: string]: OrderItem[]}>({})
  const { name } = useAtomValue(configAtom) || {}

  const currentConfig = configId 
    ? printConfigurations.find(config => config.id === configId)
    : null

  const [getCategoryOrders, ordersQuery] = useLazyQuery(
    productQueries.getCategoryOrders,
    {
      onCompleted({ poscProducts }) {
        const categoriesToUse = currentConfig ? currentConfig.categories : categoryOrders
        const productsNeedProcess = filterProductsNeedProcess(
          poscProducts,
          categoriesToUse
        )
        const checkedItems = onlyNewItems
          ? items?.filter((item: OrderItem) =>
              productsNeedProcess.includes(item.productId)
            )
          : items || []
        
        if (currentConfig && currentConfig.categories.length > 0) {
          const grouped: {[key: string]: OrderItem[]} = {}
          currentConfig.categories.forEach(categoryOrder => {
            const categoryProducts = poscProducts
              .filter((product: IProduct) => product?.category?.order?.includes(categoryOrder))
              .map((product: IProduct) => product._id)
            
            const categoryItems = checkedItems.filter((item: OrderItem) => 
              categoryProducts.includes(item.productId)
            )
            
            if (categoryItems.length > 0) {
              const sampleProduct = poscProducts.find((product: IProduct) => 
                categoryProducts.includes(product._id)
              )
              const categoryName = sampleProduct?.category?.name || categoryOrder.split('/').pop() || categoryOrder
              grouped[categoryName] = categoryItems
            }
          })
          setGroupedItems(grouped)
        }
        
        setItemsToPrint(checkedItems)
      },
    }
  )

  const { loading, data } = useQuery(queries.progressDetail, {
    variables: { id },
    fetchPolicy: "network-only",
    onCompleted({ orderDetail }) {
      const categoriesToUse = currentConfig ? currentConfig.categories : categoryOrders
      
      if (forCustomer) {
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

      if (categoriesToUse.length > 0) {
        return getCategoryOrders({
          variables: {
            ids: itemsToProcess.map((item: OrderItem) => item.productId),
          },
        })
      }

      setItemsToPrint(itemsToProcess)
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
      window.print()
    }
  }, [itemsToPrint])

  const printItems = useMemo(() => {
    if (forCustomer) {
      return items
    }
    if (onlyNewItems || categoryOrders.length || currentConfig) {
      return itemsToPrint
    }
    return items || []
  }, [forCustomer, onlyNewItems, categoryOrders.length, currentConfig, itemsToPrint, items])

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
        {currentConfig && Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([categoryName, categoryItems], index) => (
            <div key={categoryName}>
              {index > 0 && (
                <div className="my-2">
                  <div className="border-t border-dashed border-gray-400 my-1"></div>
                </div>
              )}
              {Object.keys(groupedItems).length > 1 && (
                <div className="font-semibold text-xs mb-1 uppercase">{categoryName}</div>
              )}
              {categoryItems.map((item: OrderItem) => (
                <div className="flex items-center" key={item._id}>
                  <span className="flex-auto">{item.productName}</span>
                  <span>
                    x{item.count}{" "}
                    {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
                  </span>
                  {forCustomer && (
                    <span className="ml-1 w-1/4 text-right">
                      {(item.unitPrice * item.count).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          printItems.map((item: OrderItem) => (
            <div className="flex items-center" key={item._id}>
              <span className="flex-auto">{item.productName}</span>
              <span>
                x{item.count}{" "}
                {item.status === ORDER_ITEM_STATUSES.CONFIRM && "!!!"}
              </span>
              {forCustomer && (
                <span className="ml-1 w-1/4 text-right">
                  {(item.unitPrice * item.count).toLocaleString()}
                </span>
              )}
            </div>
          ))
        )}
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
              {items
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
