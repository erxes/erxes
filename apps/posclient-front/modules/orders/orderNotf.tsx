import { useEffect, useCallback } from "react";
import { useSetAtom, useAtomValue, useAtom } from "jotai";
import { Bell } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import OrderNotificationCarousel from "./components/orderNotfModal/orderNotfModal.main";
import useFullOrders from "./hooks/useFullOrders";
import { queries } from "./graphql";
import { activeOrderIdAtom, setInitialAtom, isShowAtom , previousOrderCountRefAtom } from "@/store/order.store";
import { selectedTabAtom, orderCollapsibleAtom, orderNotificationEnabledAtom } from "@/store";

interface Subscription {
  unsubscribe: () => void;
}

const OrderNotf = () => {
  const setSelectedTab = useSetAtom(selectedTabAtom);
  const setActiveOrderId = useSetAtom(activeOrderIdAtom);
  const setInitialStates = useSetAtom(setInitialAtom);
  const setOpenCollapsible = useSetAtom(orderCollapsibleAtom);
  const isNotificationEnabled = useAtomValue(orderNotificationEnabledAtom);
  const [isShow, setIsShow] = useAtom(isShowAtom);
  const [previousOrderCount, setPreviousOrderCount] = useAtom(previousOrderCountRefAtom);

  const {
    fullOrders,
    subToOrderStatuses,
    totalCount,
    loading,
    handleLoadMore,
    refetch,
  } = useFullOrders({
    variables: {
      sortDirection: -1,
      sortField: "createdAt",
      isPaid: false,
      statuses: ORDER_STATUSES.ALL,
    },
    query: queries.activeOrders,
    onCompleted(orders) {
      if (orders.length === 1) {
        setActiveOrderId(orders[0]._id);
        setSelectedTab("products");
      }
    },
  });

  const subToOrderStatusesMemoized = useCallback((): Subscription | void => {
    if (isNotificationEnabled) {
      return subToOrderStatuses(ORDER_STATUSES.ALL);
    }
  }, [subToOrderStatuses, isNotificationEnabled]);

  useEffect(() => {
    try {
      const subscription = subToOrderStatusesMemoized();
      return () => {
        if (subscription?.unsubscribe) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error("Error subscribing to order statuses:", error);
    }
  }, [subToOrderStatusesMemoized]);

  useEffect(() => {
    try {
      if (isNotificationEnabled && totalCount > previousOrderCount) {
        setIsShow(true);
      }
      setPreviousOrderCount(totalCount);
    } catch (error) {
      console.error("Error updating order notifications:", error);
    }
  }, [totalCount, isNotificationEnabled, setIsShow, previousOrderCount, setPreviousOrderCount]);

  const handleCancelComplete = () => {
    setInitialStates();
    setOpenCollapsible(false);
    setIsShow(false);
    refetch();
  };

  if (!isNotificationEnabled) {
    return null;
  }

  return (
    <Dialog open={isShow} onOpenChange={setIsShow}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {totalCount > 0 && (
            <Bell className="h-5 w-5 text-orange-500" />
          )}
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
            {totalCount} {totalCount === 1 ? "order" : "orders"} waiting
          </DialogDescription>
        </DialogHeader>

        <OrderNotificationCarousel
          fullOrders={fullOrders}
          totalCount={totalCount}
          loading={loading}
          handleLoadMore={handleLoadMore}
          onCancelComplete={handleCancelComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OrderNotf;