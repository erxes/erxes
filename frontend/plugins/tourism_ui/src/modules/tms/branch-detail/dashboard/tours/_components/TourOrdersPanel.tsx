'use client';

import {
  IconCalendarEventFilled,
  IconClipboardList,
  IconUsers,
} from '@tabler/icons-react';
import { useTourOrders, ITourOrder } from '../hooks/useTourOrders';
import { Card, Separator } from 'erxes-ui';
import { useState } from 'react';
import { CustomersInline } from 'ui-modules';
import { OrderDetailSheet } from './OrderDetailSheet';

interface Props {
  readonly tourId: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: Readonly<{ status?: string }>) {
  const colorMap: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    prepaid: 'bg-blue-100 text-blue-700',
    refunded: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const labelMap: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    prepaid: 'Prepaid',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };

  const safeStatus = status ?? 'pending';
  const cls = colorMap[safeStatus] ?? 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${cls}`}
    >
      {labelMap[safeStatus] ?? 'Pending'}
    </span>
  );
}

function OrderRow({
  order,
  onClick,
}: Readonly<{
  order: ITourOrder;
  onClick: () => void;
}>) {
  return (
    <Card
      className="overflow-hidden transition cursor-pointer bg-background hover:bg-muted/40"
      onClick={onClick}
    >
      <div className="flex items-start justify-between px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none text-foreground">
            {order._id ?? 'Order:'}
          </span>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <Separator />

      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {order.numberOfPeople != null && (
            <span className="flex items-center gap-1">
              <IconUsers className="w-3.5 h-3.5" />
              {order.numberOfPeople}
            </span>
          )}

          {order.type && (
            <span className="px-2 py-0.5 rounded-md bg-muted text-[11px]">
              {order.type}
            </span>
          )}
        </div>

        {order.note && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {order.note}
          </p>
        )}

        {order.amount != null && (
          <div className="text-right">
            <span className="text-base font-semibold text-primary">
              {order.amount.toLocaleString()} USD
            </span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between h-10 px-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconCalendarEventFilled className="w-4 h-4" />
          <span>{formatDate(order.createdAt)}</span>
        </div>

        <CustomersInline.Provider
          customerIds={order.customerId ? [order.customerId] : []}
        >
          <CustomersInline.Avatar size="lg" />
        </CustomersInline.Provider>
      </div>
    </Card>
  );
}

export const TourOrdersPanel = ({ tourId }: Props) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { orders, totalCount } = useTourOrders({
    variables: { tourId },
    skip: !tourId,
  });

  // if (loading) {
  //   return (
  //     <div className="p-3 space-y-3">
  //       {Array.from({ length: 3 }).map((_, i) => (
  //         <div
  //           key={i}
  //           className="p-3 space-y-2 bg-white border rounded-xl animate-pulse"
  //         >
  //           <div className="flex justify-between">
  //             <div className="w-24 h-3 bg-gray-200 rounded" />
  //             <div className="h-4 bg-gray-200 rounded-full w-14" />
  //           </div>

  //           <div className="w-20 h-3 bg-gray-200 rounded" />

  //           <div className="flex justify-between">
  //             <div className="w-16 h-3 bg-gray-200 rounded" />
  //             <div className="w-20 h-4 bg-gray-300 rounded" />
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
        <IconClipboardList className="w-8 h-8 text-muted-foreground" />

        <h3 className="text-base font-semibold">No bookings yet</h3>

        <p className="max-w-xs text-sm text-muted-foreground">
          This tour doesn’t have any bookings yet. Once customers make a
          reservation, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">
            {totalCount === 1 ? '1 booking' : `${totalCount} bookings`}
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            Tour bookings
          </span>
        </div>

        {orders.map((order) => (
          <OrderRow
            key={order._id}
            order={order}
            onClick={() => setSelectedOrderId(order._id)}
          />
        ))}
      </div>
      <OrderDetailSheet
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      />
    </>
  );
};
