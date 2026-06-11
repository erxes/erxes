import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Sheet, useQueryState } from 'erxes-ui';
import type { ReactNode } from 'react';
import {
  IPosOrderDetail,
  IOrderCustomer,
  IOrderItem,
  IPaidAmount,
  IPutResponse,
} from '../types/msDynamicCheckOrder';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

type Props = {
  orders: IPosOrderDetail;
};

const formatAmount = (value?: number) => (value || 0).toLocaleString();

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b py-2 text-sm">
    <span className="font-medium text-muted-foreground">{label}</span>
    <span className="text-right">{value || '-'}</span>
  </div>
);

const DetailSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={className || 'rounded-lg border bg-card p-4 space-y-2'}>
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h3>
    {children}
  </section>
);

const generateCustomerLabel = (customer?: IOrderCustomer) => {
  if (!customer) return '';

  const { firstName, lastName, primaryPhone, primaryEmail } = customer;

  let value = firstName ? firstName.toUpperCase() : '';

  if (lastName) value += ` ${lastName}`;
  if (primaryPhone) value += ` (${primaryPhone})`;
  if (primaryEmail) value += ` /${primaryEmail}/`;

  return value;
};

const PosOrderDetailContent = ({ orders }: Props) => (
  <>
    <DetailSection title="Order Info">
      <DetailRow
        label={(orders.customerType || 'Customer').toUpperCase()}
        value={orders.customer ? generateCustomerLabel(orders.customer) : ''}
      />
      <DetailRow label="Bill Number" value={orders.number} />
      <DetailRow
        label="Date"
        value={dayjs(orders.paidDate || orders.createdAt).format(
          'YYYY-MM-DD HH:mm',
        )}
      />
      {orders.deliveryInfo && (
        <DetailRow
          label="Delivery Info"
          value={orders.deliveryInfo.description}
        />
      )}
      {orders.syncErkhetInfo && (
        <DetailRow label="Erkhet Info" value={orders.syncErkhetInfo} />
      )}
      {orders.convertDealId && (
        <DetailRow
          label="Deal"
          value={
            <Link to={orders.dealLink || ''} className="text-primary underline">
              {orders.deal?.name || 'Deal'}
            </Link>
          }
        />
      )}
    </DetailSection>

    {(orders.putResponses || []).length > 0 && (
      <DetailSection title="Ebarimt Responses">
        {orders.putResponses?.map((response: IPutResponse) => (
          <div key={response.billId} className="space-y-1">
            <DetailRow label="Bill ID" value={response.billId} />
            <DetailRow
              label="Ebarimt Date"
              value={dayjs(response.date).format('LLL')}
            />
          </div>
        ))}
      </DetailSection>
    )}

    <DetailSection
      title="Items"
      className="rounded-lg border bg-card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y bg-muted/30">
              <th className="px-3 py-2 text-left font-medium">Product</th>
              <th className="px-3 py-2 text-left font-medium">Count</th>
              <th className="px-3 py-2 text-left font-medium">Unit Price</th>
              <th className="px-3 py-2 text-left font-medium">Amount</th>
              <th className="px-3 py-2 text-left font-medium">Discount</th>
            </tr>
          </thead>
          <tbody>
            {(orders.items || []).map((item: IOrderItem, index: number) => (
              <tr
                key={item._id}
                className={
                  index < (orders.items || []).length - 1 ? 'border-b' : ''
                }
              >
                <td className="px-3 py-2">{item.productName}</td>
                <td className="px-3 py-2">{item.count}</td>
                <td className="px-3 py-2">{formatAmount(item.unitPrice)}</td>
                <td className="px-3 py-2">
                  {formatAmount((item.count || 0) * (item.unitPrice || 0))}
                </td>
                <td className="px-3 py-2">
                  {formatAmount(item.discountAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DetailSection>

    <DetailSection title="Totals">
      <DetailRow
        label="Total Amount"
        value={formatAmount(orders.totalAmount)}
      />
    </DetailSection>

    <DetailSection
      title="Payment Breakdown"
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      {orders.cashAmount !== undefined && (
        <DetailRow
          label="Cash Amount"
          value={formatAmount(orders.cashAmount)}
        />
      )}
      {orders.mobileAmount !== undefined && (
        <DetailRow
          label="Mobile Amount"
          value={formatAmount(orders.mobileAmount)}
        />
      )}
      {(orders.paidAmounts || []).map((paid: IPaidAmount) => (
        <DetailRow
          key={paid._id}
          label={paid.type}
          value={formatAmount(paid.amount)}
        />
      ))}
    </DetailSection>
  </>
);

const PosOrderDetail = ({ orders }: Props) => {
  const [orderDetailId, setOrderDetailId] =
    useQueryState<string>(ORDER_DETAIL_ID_KEY);

  const open = Boolean(orderDetailId) && orderDetailId === orders?._id;

  const handleOpenChange = (next: boolean) => {
    if (!next) setOrderDetailId(null);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal>
      <Sheet.View className="sm:max-w-3xl">
        <Sheet.Header>
          <Sheet.Title>Order Detail</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto p-5 space-y-5">
          {orders ? (
            <PosOrderDetailContent orders={orders} />
          ) : (
            <div className="text-sm text-muted-foreground">
              Order not found.
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export { PosOrderDetail };
