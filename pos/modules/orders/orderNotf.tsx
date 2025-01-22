"use client"

import { useState, useEffect } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { Bell, AlertCircle } from 'lucide-react'
import { 
  activeOrderIdAtom, 
  setInitialAtom 
} from "@/store/order.store"
import { totalAmountAtom } from "@/store/cart.store"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import { openCancelDialogAtom } from "@/store/history.store"
import { orderCollapsibleAtom } from "@/store"
import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog"

import OrderNotificationCarousel from "./components/orderNotfModal/orderNotfModal.main"
import useFullOrders from "./hooks/useFullOrders"
import { queries } from "./graphql"

const OrderNotf = () => {
  const { ALL } = ORDER_STATUSES
  const total = useAtomValue(totalAmountAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  const setActiveOrderId = useSetAtom(activeOrderIdAtom)
  const setSlotCode = useSetAtom(slotFilterAtom)
  const changeCancel = useSetAtom(openCancelDialogAtom)
  const setInitialStates = useSetAtom(setInitialAtom)
  const setOpenCollapsible = useSetAtom(orderCollapsibleAtom)

  const [isOpen, setIsOpen] = useState(false)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const {
    fullOrders,
    subToOrderStatuses,
    totalCount,
    loading,
    handleLoadMore,
    refetch
  } = useFullOrders({
    variables: {
      sortDirection: -1,
      sortField: "createdAt",
      isPaid: false,
      statuses: ALL,
    },
    query: queries.activeOrders,
    onCompleted(orders) {
      if (orders.length === 1) {
        setActiveOrderId(orders[0]._id)
        setSelectedTab("products")
      }
    },
  })

  useEffect(() => {
    const subscription: any = subToOrderStatuses(ORDER_STATUSES.ALL) 
     return () => 
        {  subscription?.unsubscribe?.()
     }
  }, [subToOrderStatuses])

  useEffect(() => {
    try {
    if (totalCount > previousOrderCount) {
      setIsOpen(true)
    }
    setPreviousOrderCount(totalCount)
    } catch (error) { 
         console.error('Error updating order notifications:', error) 
        }
  }, [totalCount, previousOrderCount])
  const handleOrderClick = (orderId: string) => {
    setActiveOrderId(orderId)
    setSelectedTab("products")
    setIsOpen(false)
  }

  const handleReject = (orderToReject: { _id: string, number: string }) => {
    setOrderId(orderToReject._id)
    setOrderNumber(orderToReject.number)
    changeCancel(orderToReject._id)
  }

  const handleCancelComplete = () => {
    setInitialStates()
    setOpenCollapsible(false)
    setIsOpen(false)
    refetch()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {totalCount > 0 ? <AlertCircle className="h-5 w-5 text-orange-500" /> : <Bell className="h-5 w-5" />}
          {totalCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 px-2 py-1 text-xs"
            >
              {totalCount}
            </Badge>
          )}
          <span className="sr-only">Order Notifications</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">New Orders</DialogTitle>
          <DialogDescription className="text-lg">
            {totalCount} {totalCount === 1 ? 'order' : 'orders'} waiting
          </DialogDescription>
        </DialogHeader>

        <OrderNotificationCarousel 
          fullOrders={fullOrders} 
          onOrderApprove={handleOrderClick}
          onOrderReject={handleReject}
          totalCount={totalCount}
          loading={loading}
          handleLoadMore={handleLoadMore}
          orderId={orderId}
          orderNumber={orderNumber}
          onCancelComplete={handleCancelComplete}
        />
      </DialogContent>
    </Dialog>
  )
}

export default OrderNotf