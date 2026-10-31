import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { useQuery } from '@apollo/client';
import { IconReceipt } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  ContactWidgetRow,
  ContactWidgetSection,
  IContactWidgetProps,
  useSidePanel,
} from 'ui-modules';
import { SALES_CONTACT_POS_ORDERS } from '~/widgets/contact/contactPosOrders';

const CONTACT_RECORDS_LIMIT = 50;

export const PosOrdersContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('sales');
  const { openRecord } = useSidePanel();
  const { data, loading, error } = useQuery(SALES_CONTACT_POS_ORDERS, {
    variables: {
      customerId: contentId,
      customerType: contentType === 'core:company' ? 'company' : 'customer',
      perPage: CONTACT_RECORDS_LIMIT,
    },
  });
  const orders = (data?.posOrders || []).flatMap((order) =>
    order?._id ? [{ ...order, _id: order._id }] : [],
  );
  const ordersById = new Map(orders.map((order) => [order._id, order]));

  return (
    <ContactWidgetSection
      icon={IconReceipt}
      label={t('pos-orders')}
      ids={[...ordersById.keys()]}
      loading={loading}
      emptyText={error?.message}
      renderItem={(orderId) => {
        const order = ordersById.get(orderId);
        const date = order?.paidDate || order?.createdAt;

        return (
          order && (
            <ContactWidgetRow
              title={order.number ? `#${order.number}` : order._id}
              meta={[
                (order.totalAmount || 0).toLocaleString(),
                date ? dayjs(date).format('YYYY-MM-DD') : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              onClick={() =>
                openRecord(
                  { contentType: POS_ORDER_CONTENT_TYPE, contentId: orderId },
                  { stack: true },
                )
              }
            />
          )
        );
      }}
    />
  );
};
