import { useMemo, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { RecordTable, useToast } from 'erxes-ui';
import { IconInbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getCheckSyncedOrdersColumns } from './CheckSyncedOrdersColumns';
import {
  ISyncedOrderInfo,
  ICheckSyncedOrderStatus,
} from '../types/msDynamicCheckOrder';
import { MSDynamicCheckOrderCommandBar } from './MSDynamicCheckOrderCommandBar';
import { useMSDynamicCheckOrder } from '../hooks/useMSDynamicCheckOrder';
import { mutations } from '../../graphql';

type TCheckSyncedOrdersResponse = {
  toCheckMsdSynced: ICheckSyncedOrderStatus[];
};

type TSendMsdOrdersResponse = {
  toSendMsdOrders: ICheckSyncedOrderStatus;
};

/** Empty ued synced order list deer message gargana. */
const CheckSyncedOrdersEmptyState = () => {
  const { t } = useTranslation('mongolian');
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center px-8 text-center">
      <div>
        <IconInbox size={64} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-semibold">{t('no-order-yet')}</h3>
      </div>
    </div>
  );
};

/** Msdynamic synced order check table haruulna. */
const CheckSyncedOrders = () => {
  const { t } = useTranslation('mongolian');
  const { loading, orders, handleFetchMore, pageInfo } =
    useMSDynamicCheckOrder();
  const { toast } = useToast();

  const [syncedOrderInfos, setSyncedOrderInfos] = useState<
    Record<string, ISyncedOrderInfo>
  >({});

  const [toCheckMsdSynced, { loading: checkingSyncedOrders }] = useMutation<
    TCheckSyncedOrdersResponse,
    { ids: string[] }
  >(gql(mutations.toCheckMsdSynced));
  const [toSendMsdOrdersMutation] = useMutation<
    TSendMsdOrdersResponse,
    { orderIds: string[] }
  >(gql(mutations.toSendMsdOrders));

  /** Selected orders msdynamic ruu synced uu gedgiig shalgana. */
  const onCheck = async (orderIds: string[]): Promise<void> => {
    try {
      const response = await toCheckMsdSynced({
        variables: { ids: orderIds },
      });

      const statuses = response.data?.toCheckMsdSynced || [];

      const syncedInfos: Record<string, ISyncedOrderInfo> = {};

      statuses
        .filter((s) => s.isSynced)
        .forEach((item) => {
          syncedInfos[item._id] = {
            syncedBillNumber: item.syncedBillNumber || '',
            syncedDate: item.syncedDate || '',
            syncedCustomer: item.syncedCustomer || '',
          };
        });

      setSyncedOrderInfos((prev) => {
        const checkedIds = new Set(orderIds);
        const remainingInfos = Object.fromEntries(
          Object.entries(prev).filter(([orderId]) => !checkedIds.has(orderId)),
        );

        return { ...remainingInfos, ...syncedInfos };
      });
      toast({
        title: t('orders-checked-successfully'),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: t('failed-to-check-orders'),
        description:
          error instanceof Error ? error.message : t('please-try-again-later'),
        variant: 'destructive',
      });
    }
  };

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  /** Table columns-iig synced info-toi memo hiine. */
  const columns = useMemo(() => {
    /** Neg order dahin yavuulaad synced info update hiine. */
    const resend = async (orderId: string) => {
      try {
        const response = await toSendMsdOrdersMutation({
          variables: { orderIds: [orderId] },
        });

        const item = response.data?.toSendMsdOrders;

        if (!item) return;

        setSyncedOrderInfos((prev) => ({
          ...prev,
          [item._id]: {
            syncedBillNumber: item.syncedBillNumber || '',
            syncedDate: item.syncedDate || '',
            syncedCustomer: item.syncedCustomer || '',
          },
        }));
        toast({
          title: t('order-resent-successfully'),
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: t('failed-to-resend-order'),
          description:
            error instanceof Error ? error.message : t('please-try-again-later'),
          variant: 'destructive',
        });
      }
    };

    return getCheckSyncedOrdersColumns({
      syncedOrderInfos,
      onResend: resend,
      t,
    });
  }, [syncedOrderInfos, toSendMsdOrdersMutation, toast, t]);

  return (
    <RecordTable.Provider
      columns={columns}
      data={orders || []}
      className="m-0"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <MSDynamicCheckOrderCommandBar
        checking={checkingSyncedOrders}
        onCheck={onCheck}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={orders?.length}
        sessionKey="syncedOrders"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && orders?.length === 0 && <CheckSyncedOrdersEmptyState />}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

export { CheckSyncedOrders };
