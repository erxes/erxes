'use client';

import {
  IconCalendarEventFilled,
  IconClipboardList,
  IconFilter,
  IconUsers,
} from '@tabler/icons-react';
import { useTourOrders, type ITourOrder } from '../hooks/useTourOrders';
import { Card, Select, Separator, Spinner } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { CustomersInline } from 'ui-modules';
import { OrderDetailSheet } from './OrderDetailSheet';
import { OrderPaymentStatus } from './OrderPaymentStatus';

interface Props {
  readonly tourId: string;
}

const PAYMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
] as const;

type PaymentFilterValue = (typeof PAYMENT_FILTER_OPTIONS)[number]['value'];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function OrderRow({
  order,
  onClick,
}: Readonly<{ order: ITourOrder; onClick: () => void }>) {
  const people = order.people;
  const totalPeople =
    (people?.adults ?? 0) + (people?.children ?? 0) + (people?.infants ?? 0);
  const totalAmount = order.pricing?.totalAmount;
  const hasCustomer = Boolean(order.primaryCustomerId);

  return (
    <CustomersInline.Provider
      customerIds={order.primaryCustomerId ? [order.primaryCustomerId] : []}
      placeholder="Guest"
    >
      <Card
        className="overflow-hidden transition-all border cursor-pointer bg-background hover:bg-muted/30"
        onClick={onClick}
      >
        <div className="p-3 space-y-3">
          {/* Top row: avatar + name + badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {hasCustomer ? (
                <CustomersInline.Avatar size="xl" />
              ) : (
                <div className="flex items-center justify-center rounded-full size-10 bg-muted text-muted-foreground shrink-0">
                  <IconUsers className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-semibold truncate text-foreground">
                  {hasCustomer ? <CustomersInline.Title /> : 'Guest booking'}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground truncate">
                  #{order._id}
                </div>
              </div>
            </div>

            <OrderPaymentStatus
              orderStatus={order.status}
              paymentStatus={order.payment?.status}
            />
          </div>

          {/* People + package pill row */}
          <div className="flex flex-wrap gap-1.5">
            {totalPeople > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                <IconUsers className="w-3 h-3" />
                {people?.adults ? `${people.adults}A` : ''}
                {people?.children ? ` ${people.children}C` : ''}
                {people?.infants ? ` ${people.infants}I` : ''}
              </span>
            )}
            {order.package?.title && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground max-w-40 truncate">
                {order.package.title}
              </span>
            )}
          </div>

          {/* Amount */}
          {totalAmount != null && (
            <div className="flex items-end justify-between">
              <div>
                {order.prepaid?.enabled && (
                  <div className="text-[10px] text-muted-foreground">
                    Advance{' '}
                    <span className="text-amber-300 font-medium">
                      {order.prepaid.amount.toLocaleString()}
                    </span>{' '}
                    · Remaining{' '}
                    <span className="text-foreground font-medium">
                      {order.prepaid.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Total
                </div>
                <div className="text-xl font-semibold leading-none text-foreground">
                  {totalAmount.toLocaleString()}
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                    MNT
                  </span>
                </div>
              </div>
            </div>
          )}

          {order.note && (
            <div className="px-2.5 py-2 border rounded-lg bg-muted/50 border-border/60">
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {order.note}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between px-3 text-xs h-10 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <IconCalendarEventFilled className="w-3.5 h-3.5" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <span className="text-[11px]">View details →</span>
        </div>
      </Card>
    </CustomersInline.Provider>
  );
}

export const TourOrdersPanel = ({ tourId }: Props) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilterValue>('all');
  const { orders, refetch, loading } = useTourOrders({
    variables: { tourId },
    skip: !tourId,
  });

  const filteredOrders = useMemo(() => {
    if (paymentFilter === 'all') return orders;
    return orders.filter(
      (order) => (order.payment?.status ?? 'pending') === paymentFilter,
    );
  }, [orders, paymentFilter]);

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
          Once customers make a reservation, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full p-3">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 px-1 pb-3 mb-4 border-b border-border/60">
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <Select
              value={paymentFilter}
              onValueChange={(v) => setPaymentFilter(v as PaymentFilterValue)}
            >
              <Select.Trigger className="h-9 max-w-[130px] rounded-md border border-border/60 bg-muted/30 px-3 text-sm text-foreground shadow-none">
                <div className="flex items-center min-w-0 gap-2">
                  <IconFilter className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Select.Value placeholder="Payment" />
                </div>
              </Select.Trigger>
              <Select.Content>
                {PAYMENT_FILTER_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <span className="text-xs text-muted-foreground">
              {filteredOrders.length}{' '}
              {filteredOrders.length === 1 ? 'record' : 'records'}
            </span>
          </div>
        </div>

        {/* List */}
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
            <div className="flex flex-col items-center gap-2 px-4 text-center min-h-32">
              <IconClipboardList className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No matching bookings
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                No bookings match the selected payment status.
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
