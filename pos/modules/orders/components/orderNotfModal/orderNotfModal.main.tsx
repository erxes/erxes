"use client"

import { Check, X } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Button } from "@/components/ui/button"
import { IOrder } from '@/types/order.types'
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import OrderCancel from "@/app/(main)/(orders)/components/history/orderCancel"
import { activeOrderIdAtom } from '@/store/order.store'
import { nextOrderIdAtom } from '@/store'
import { useState } from 'react'

interface OrderNotificationCarouselProps {
  fullOrders: IOrder[];
  onOrderApprove: (orderId: string) => void;
  onOrderReject: (order: { _id: string; number: string }) => void;
  totalCount: number;
  loading: boolean;
  handleLoadMore: () => void;
  orderId: string | null;
  orderNumber: string | null;
  onCancelComplete: () => void;
}

const OrderNotificationCarousel: React.FC<OrderNotificationCarouselProps> = ({
  fullOrders,
  onOrderApprove,
  onOrderReject,
  totalCount,
  loading,
  handleLoadMore,
  orderId,
  orderNumber,
  onCancelComplete
}) => {
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const setNextOrder = useSetAtom(nextOrderIdAtom)

  const [error, setError] = useState<string | null>(null)

  const handleLoadMoreWithErrorHandling = async () => {
    try {
      await handleLoadMore()
      setError(null) 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more orders. Please try again later.')
    }
  }

  return (
    <>
      <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
  {fullOrders.length === 0 ? (
    <div className="flex justify-center items-center h-full">
      <p>No orders to display</p>
    </div>
  ) : (
    fullOrders.map((order) => (
      <CarouselItem key={order._id}>
        <Card>
          <CardHeader>
            <CardTitle>Order #{order.number}</CardTitle>
            <CardDescription>Status: {order.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Table: {order.slotCode}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={() => onOrderApprove(order._id)} 
              variant="outline" 
              size="sm"
            >
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button 
             onClick={() => {  
                if (!order.number) {  
                  console.error('Order number is missing:', order);  
                  return;  
                }  
                onOrderReject({ _id: order._id, number: order.number });  
              }}  
              variant="outline" 
              size="sm"
            >
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
          </CardFooter>
        </Card>
      </CarouselItem>
    ))
  )}
</CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {totalCount > fullOrders.length && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !!error}
          className="w-full mt-4"
          onClick={handleLoadMoreWithErrorHandling}
        >
          {error ? 'Error loading orders' : loading ? 'Loading...' : `Load More (${fullOrders.length} / ${totalCount})`}
        </Button>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      {orderId && orderNumber && (
        <OrderCancel
          _id={orderId}
          number={orderNumber}
          refetchQueries={["ActiveOrders"]}
          onCompleted={onCancelComplete}
        />
      )}
    </>
  )
}

export default OrderNotificationCarousel