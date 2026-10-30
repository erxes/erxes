import { DealCardProducts } from '@/deals/boards/components/DealsBoardCardDetails';
import { POS_ORDER_TRANSACTIONS } from '@/pos/orders/detail/graphql/queries/posOrderTransactionsQuery';
import { usePosOrderPayments } from '@/pos/orders/detail/hooks/usePosOrderPayments';
import { usePosOrderQuery } from '@/pos/orders/detail/hooks/usePosOrderQuery';
import { PosOrderForm } from '@/pos/orders/detail/PosOrderForm';
import { useQuery } from '@apollo/client';
import {
  IconBriefcase,
  IconBuildingStore,
  IconCalendar,
  IconCircleDot,
  IconExternalLink,
  IconFileInvoice,
  IconReceipt,
  IconRefresh,
  IconSandbox,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Badge, Button, CopyText, Form, isEnabled } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PanelField, useSidePanel } from 'ui-modules';
import {
  PosPanelAside,
  PosPanelDetailLayout,
  PosPanelFields,
  PosPanelText,
} from '~/widgets/record-panel/PosPanelShared';

type TPosOrder = NonNullable<ReturnType<typeof usePosOrderQuery>['posOrder']>;

const formatDate = (value?: string | number | Date | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';

const toNumber = (value: unknown) => Number(value) || 0;

const PosOrderCustomer = ({ order }: { order: TPosOrder }) => {
  const { openRecord } = useSidePanel();
  const customer = order.customer;

  if (!customer?._id) {
    return <PosPanelText>-</PosPanelText>;
  }

  const name =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    customer.primaryEmail ||
    customer.primaryPhone ||
    customer.code ||
    '-';

  if (order.customerType === 'user') {
    return <PosPanelText>{name}</PosPanelText>;
  }

  return (
    <Button
      variant="ghost"
      className="h-7 w-full justify-start rounded-sm px-2 text-xs font-normal"
      onClick={() =>
        openRecord(
          {
            contentType:
              order.customerType === 'company'
                ? 'core:company'
                : 'core:customer',
            contentId: customer._id,
          },
          { stack: true },
        )
      }
    >
      <span className="truncate">{name}</span>
    </Button>
  );
};

const PosOrderTransaction = ({ orderId }: { orderId: string }) => {
  const { data } = useQuery(POS_ORDER_TRANSACTIONS, {
    variables: { contentType: 'sales:order', contentId: orderId },
    fetchPolicy: 'cache-and-network',
  });
  const transaction = data?.accTransactionsByContent?.list?.[0];

  if (!transaction) {
    return <PosPanelText>-</PosPanelText>;
  }

  return (
    <a
      href={`/accounting/transaction/edit?parentId=${encodeURIComponent(
        transaction.parentId || transaction._id || '',
      )}`}
      target="_blank"
      rel="noreferrer"
      className="flex h-7 items-center gap-1 px-2 text-xs text-primary hover:underline"
    >
      <span className="truncate">
        {transaction.number || transaction.ptrNumber || transaction._id}
      </span>
      <IconExternalLink className="size-3.5 shrink-0" />
    </a>
  );
};

const PosOrderPayments = ({ order }: { order: TPosOrder }) => {
  const { t } = useTranslation('sales');
  const { methods, paymentSummary, isLocked, saving, onSubmit } =
    usePosOrderPayments(order);

  return (
    <Form {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <span className="text-sm font-medium">{t('payments')}</span>
        <PosOrderForm
          control={methods.control}
          summary={paymentSummary}
          paidAmounts={order.paidAmounts}
          posName={order.posName ?? undefined}
        />
        <Button type="submit" disabled={saving || isLocked}>
          {t('save-payments-change')}
        </Button>
      </form>
    </Form>
  );
};

export const PosOrderPanelDetail = ({ orderId }: { orderId: string }) => {
  const { t } = useTranslation('sales');
  const {
    posOrder: order,
    loading,
    error,
  } = usePosOrderQuery(orderId, 'cache-first');

  const items = (order?.items || []).map((item, index) => {
    const quantity = toNumber(item.count);
    const unitPrice = toNumber(item.unitPrice);

    return {
      _id: `${index}`,
      name: item.productName || item.product?.name || t('unknown-product'),
      quantity,
      unitPrice,
      amount:
        item.amount != null
          ? toNumber(item.amount)
          : quantity * unitPrice - toNumber(item.discountAmount),
    };
  });

  return (
    <PosPanelDetailLayout
      loading={loading}
      hasRecord={!!order}
      error={error}
      emptyMessage={t('order-not-found')}
    >
      {order && (
        <>
          <PosPanelFields>
            <div className="flex items-center gap-2 pb-1">
              {order.number && (
                <CopyText
                  value={order.number}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  #{order.number}
                </CopyText>
              )}
              {order.status && (
                <Badge variant="secondary">{t(order.status)}</Badge>
              )}
            </div>
            <PanelField icon={IconUser} label={t('customer')} cell={false}>
              <PosOrderCustomer order={order} />
            </PanelField>
            {order.brokerType && (
              <PanelField icon={IconBriefcase} label={t('broker')} cell={false}>
                <PosPanelText>
                  {order.brokerName || order.brokerId || '-'} (
                  {t(order.brokerType)})
                </PosPanelText>
              </PanelField>
            )}
            <PanelField icon={IconBuildingStore} label={t('pos')} cell={false}>
              <PosPanelText>{order.posName || '-'}</PosPanelText>
            </PanelField>
            <PanelField icon={IconCalendar} label={t('date')} cell={false}>
              <PosPanelText>{formatDate(order.createdAt)}</PosPanelText>
            </PanelField>
            <PanelField icon={IconCircleDot} label={t('status')} cell={false}>
              <PosPanelText>
                {order.status ? t(order.status) : '-'}
              </PosPanelText>
            </PanelField>
            <PanelField icon={IconReceipt} label={t('bill-id')} cell={false}>
              <PosPanelText>{order.billId || '-'}</PosPanelText>
            </PanelField>
            <PanelField
              icon={IconCalendar}
              label={t('ebarimt-date')}
              cell={false}
            >
              <PosPanelText>
                {formatDate(order.putResponses?.[0]?.createdAt)}
              </PosPanelText>
            </PanelField>
            {isEnabled('accounting') && order._id && (
              <PanelField
                icon={IconFileInvoice}
                label={t('transaction')}
                cell={false}
              >
                <PosOrderTransaction orderId={order._id} />
              </PanelField>
            )}
            <PanelField
              icon={IconFileInvoice}
              label={t('accounting-response')}
              cell={false}
            >
              <PosPanelText>{order.accountingResponse || '-'}</PosPanelText>
            </PanelField>
            <PanelField
              icon={IconRefresh}
              label={t('erkhet-info')}
              cell={false}
            >
              <PosPanelText>{order.syncErkhetInfo || '-'}</PosPanelText>
            </PanelField>
            <PanelField icon={IconSandbox} label={t('deal')} cell={false}>
              <PosPanelText>{order.deal?.searchText || '-'}</PosPanelText>
            </PanelField>
          </PosPanelFields>
          <PosPanelAside>
            <DealCardProducts
              items={items}
              label={t('products')}
              totalLabel={t('total-amount')}
              maxVisible={items.length}
            />
            <PosOrderPayments order={order} />
          </PosPanelAside>
        </>
      )}
    </PosPanelDetailLayout>
  );
};
