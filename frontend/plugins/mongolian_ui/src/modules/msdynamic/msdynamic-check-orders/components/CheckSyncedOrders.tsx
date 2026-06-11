import { useMemo, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { RecordTable, useToast } from 'erxes-ui';
import { IconInbox } from '@tabler/icons-react';
import { getCheckSyncedOrdersColumns } from './CheckSyncedOrdersColumns';
import {
  ISyncedOrderInfo,
  ICheckSyncedOrderStatus,
} from '../types/msDynamicCheckOrder';
import { CheckSyncedOrdersCommandBar } from './MSDynamicCheckOrderCommandBar';
import { useMSDynamicCheckOrder } from '../hooks/useMSDynamicCheckOrder';
import { mutations } from '../../graphql';

type TCheckSyncedOrdersResponse = {
  toCheckMsdSynced: ICheckSyncedOrderStatus[];
};

type TSendMsdOrdersResponse = {
  toSendMsdOrders: ICheckSyncedOrderStatus;
};

const CheckSyncedOrders = () => {
  const { loading, orders, handleFetchMore, pageInfo } =
    useMSDynamicCheckOrder();
  const { toast } = useToast();

  const [syncedOrderInfos, setSyncedOrderInfos] = useState<
    Record<string, ISyncedOrderInfo>
  >({});

  const [toCheckMsdSynced] = useMutation<
    TCheckSyncedOrdersResponse,
    { ids: string[] }
  >(gql(mutations.toCheckMsdSynced));
  const [toSendMsdOrdersMutation] = useMutation<
    TSendMsdOrdersResponse,
    { orderIds: string[] }
  >(gql(mutations.toSendMsdOrders));

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

      setSyncedOrderInfos(syncedInfos);
      toast({
        title: 'Orders checked successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to check orders',
        description:
          error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const columns = useMemo(() => {
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
          title: 'Order resent successfully',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'Failed to resend order',
          description:
            error instanceof Error ? error.message : 'Please try again later',
          variant: 'destructive',
        });
      }
    };

    return getCheckSyncedOrdersColumns({
      syncedOrderInfos,
      onResend: resend,
    });
  }, [syncedOrderInfos, toSendMsdOrdersMutation, toast]);

  return (
    <RecordTable.Provider
      columns={columns}
      data={orders || []}
      className="m-0"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <CheckSyncedOrdersCommandBar onCheck={onCheck} />
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
        {!loading && orders?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconInbox
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No order yet</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

export { CheckSyncedOrders };
