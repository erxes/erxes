"use client"

import { Check, X , Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { IOrder } from '@/types/order.types'
import { orderIdAtom , orderNumberAtom , isShowAtom  , activeOrderIdAtom , openCancelDialogAtom } from '@/store/order.store'
import { selectedTabAtom } from '@/store'
import { useAtom , useSetAtom } from 'jotai'
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
import OrderCancel from '../orderCancel'
import { useState } from 'react'

interface OrderNotificationCarouselProps {
  fullOrders: IOrder[];
  totalCount: number;
  loading: boolean;
  handleLoadMore: () => void
  onCancelComplete: () => void;
}


const OrderNotificationCarousel: React.FC<OrderNotificationCarouselProps> = ({
  fullOrders,
  totalCount,
  loading,
  handleLoadMore,
  onCancelComplete
}) => {
  const [,setIsShow] = useAtom(isShowAtom);
  const [orderId, setOrderId] = useAtom(orderIdAtom);
  const [orderNumber, setOrderNumber] = useAtom(orderNumberAtom);
  const setActiveOrderId = useSetAtom(activeOrderIdAtom);
  const changeCancel = useSetAtom(openCancelDialogAtom);
  const setSelectedTab = useSetAtom(selectedTabAtom);

  const [error, setError] = useState<string | null>(null)

  const getButtonText = () => {
    if (loading) return <Loader2 className="animate-spin mr-2 h-4 w-4" />;
    if (error) return "Error loading orders";
    return `Load More (${fullOrders.length} / ${totalCount})`;
  };
  
  const buttonText = getButtonText();  


  const handleLoadMoreWithErrorHandling = () => {
    try {
      handleLoadMore();
    } catch (error) {
      console.error("Error loading more data:", error);
    }
  };
  

  const handleOrderClick = (orderId: string) => {
    setActiveOrderId(orderId);
    setSelectedTab("products");
    setIsShow(false);
  };

  const handleReject = (orderToReject: { _id: string; number?: string }) => {
    if (!orderToReject.number) {
      console.error('Order number is missing:', orderToReject);
      setError('Order number is missing.');
      return;
    }
  
    setOrderId(orderToReject._id);
    setOrderNumber(orderToReject.number);
    changeCancel(orderToReject._id);
  };
  

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
               onClick={() => {
                handleOrderClick(order._id);
              }}
              variant="outline" 
              size="sm"
            >
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button 
              onClick={() => handleReject(order)}
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
          {buttonText}
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