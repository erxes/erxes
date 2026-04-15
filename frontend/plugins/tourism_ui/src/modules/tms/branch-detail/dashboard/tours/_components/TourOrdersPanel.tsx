'use client';

import {
  IconCalendarEventFilled,
  IconClipboardList,
  IconFilter,
  IconUsers,
} from '@tabler/icons-react';
import { useTourOrders, ITourOrder } from '../hooks/useTourOrders';
import { Button, Card, Select, Separator, Spinner } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { CustomersInline } from 'ui-modules';
import { OrderDetailSheet } from './OrderDetailSheet';

interface Props {
  readonly tourId: string;
}

const ORDER_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

type OrderFilterValue = (typeof ORDER_FILTER_OPTIONS)[number]['value'];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: Readonly<{ status?: string }>) {
  const toneMap: Record<string, string> = {
    paid: 'border-emerald-500/15 bg-emerald-500/6 text-emerald-200',
    pending: 'border-amber-500/15 bg-amber-500/6 text-amber-200',
    prepaid: 'border-sky-500/15 bg-sky-500/6 text-sky-200',
    refunded: 'border-violet-500/15 bg-violet-500/6 text-violet-200',
    cancelled: 'border-rose-500/15 bg-rose-500/6 text-rose-200',
  };

  const labelMap: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    prepaid: 'Prepaid',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };

  const safeStatus = status ?? 'pending';
  const cls =
    toneMap[safeStatus] ?? 'border-border/60 bg-muted/60 text-muted-foreground';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-75" />
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
  const hasCustomer = Boolean(order.customerId);
  const additionalCustomersCount = Array.isArray(order.additionalCustomers)
    ? order.additionalCustomers.length
    : 0;

  return (
    <CustomersInline.Provider
      customerIds={order.customerId ? [order.customerId] : []}
      placeholder="Unnamed customer"
    >
      <Card
        className="overflow-hidden transition-all cursor-pointer border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
        onClick={onClick}
      >
        <div className="p-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center min-w-0 gap-3">
                {hasCustomer ? (
                  <CustomersInline.Avatar size="xl" />
                ) : (
                  <div className="flex items-center justify-center rounded-full size-10 bg-muted text-muted-foreground">
                    <IconUsers className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-semibold truncate text-foreground">
                    {hasCustomer ? (
                      <CustomersInline.Title />
                    ) : (
                      'Unknown customer'
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground truncate">
                    Order #{order._id ?? 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {order.numberOfPeople != null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                    <IconUsers className="w-3.5 h-3.5" />
                    {order.numberOfPeople} people
                  </span>
                )}

                {additionalCustomersCount > 0 && (
                  <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    +{additionalCustomersCount} additional
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusBadge status={order.status} />
              {order.amount != null && (
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Amount
                  </div>
                  <div className="mt-1 text-[28px] font-semibold leading-none text-foreground">
                    {order.amount.toLocaleString()}
                    <span className="ml-1 text-[12px] font-medium text-muted-foreground">
                      USD
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {order.note && (
            <div className="px-3 py-2 border rounded-lg bg-muted/50 border-border/60">
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {order.note}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between px-3 text-xs h-11 text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconCalendarEventFilled className="w-4 h-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>

          <span className="text-[11px] text-muted-foreground">
            View details
          </span>
        </div>
      </Card>
    </CustomersInline.Provider>
  );
}

export const TourOrdersPanel = ({ tourId }: Props) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderFilterValue>('all');
  const { orders, refetch, loading } = useTourOrders({
    variables: { tourId },
    skip: !tourId,
  });

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }

    return orders.filter(
      (order) => (order.status ?? 'pending') === statusFilter,
    );
  }, [orders, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

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
      <div className="flex flex-col h-full p-3">
        <div className="flex items-center justify-between gap-3 px-1 pb-3 mb-4 border-b border-border/60">
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderFilterValue)
              }
            >
              <Select.Trigger className="h-9 max-w-[100px] rounded-md border border-border/60 bg-muted/30 px-3 text-sm text-foreground shadow-none">
                <div className="flex items-center min-w-0 gap-2">
                  <IconFilter className="w-4 h-4 text-muted-foreground" />
                  <Select.Value placeholder="All statuses" />
                </div>
              </Select.Trigger>
              <Select.Content>
                {ORDER_FILTER_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <span className="inline-flex items-center px-3 text-xs font-medium rounded-md h-9 bg-muted/30 text-muted-foreground">
              {filteredOrders.length}{' '}
              {filteredOrders.length === 1 ? 'record found' : 'records found'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-3 text-xs border rounded-md h-9 border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {filteredOrders.length ? (
          <div className="space-y-3 overflow-y-auto">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => setSelectedOrderId(order._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center justify-center w-full gap-2 px-4 text-center min-h-32">
              <IconClipboardList className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No matching bookings
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                There are no bookings with the selected status right now.
              </p>
            </div>
          </div>
        )}
      </div>
      <OrderDetailSheet
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onUpdated={refetch}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      />
    </>
  );
};
