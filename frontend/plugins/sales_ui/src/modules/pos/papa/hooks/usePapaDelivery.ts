import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SALES_POS_ORDER_PAPA_APPROVE_PHOTO,
  SALES_POS_ORDER_PAPA_CANCEL,
  SALES_POS_ORDER_PAPA_DELIVERY,
  SALES_POS_ORDER_PAPA_MARK_DELIVERED,
  SALES_POS_ORDER_PAPA_PAY,
  SALES_POS_ORDER_PAPA_QUOTE,
  SALES_POS_ORDER_PAPA_REFRESH,
  SALES_POS_ORDER_PAPA_SEND,
  SALES_PAPA_WALLET,
} from '../graphql/papaDocuments';
import {
  PAPA_ACTIVE_STATUSES,
  parsePapaDeal,
  parsePapaDelivery,
} from '../utils/papaJson';

// Papa's webhook updates the order on the server; poll while a delivery can
// still change so the panel follows it without a manual refresh.
const ACTIVE_POLL_MS = 15_000;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const usePapaDelivery = (orderId: string) => {
  const { t } = useTranslation('sales');
  const { data, loading, error, startPolling, stopPolling } = useQuery(
    SALES_POS_ORDER_PAPA_DELIVERY,
    {
      variables: { id: orderId },
      fetchPolicy: 'cache-and-network',
    },
  );

  const order = data?.posOrderDetail;
  const delivery = useMemo(
    () => parsePapaDelivery(order?.papaDelivery),
    [order?.papaDelivery],
  );
  const deal = useMemo(() => parsePapaDeal(order?.papaDeal), [order?.papaDeal]);
  const isActive = !!delivery && PAPA_ACTIVE_STATUSES.includes(delivery.status);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    startPolling(ACTIVE_POLL_MS);
    return () => stopPolling();
  }, [isActive, startPolling, stopPolling]);

  const refetchOptions = {
    refetchQueries: [
      { query: SALES_POS_ORDER_PAPA_DELIVERY, variables: { id: orderId } },
    ],
    awaitRefetchQueries: true,
  };

  const [quoteMutation, quoteState] = useMutation(
    SALES_POS_ORDER_PAPA_QUOTE,
    refetchOptions,
  );
  const [sendMutation, sendState] = useMutation(
    SALES_POS_ORDER_PAPA_SEND,
    refetchOptions,
  );
  const [refreshMutation, refreshState] = useMutation(
    SALES_POS_ORDER_PAPA_REFRESH,
    refetchOptions,
  );
  const [cancelMutation, cancelState] = useMutation(
    SALES_POS_ORDER_PAPA_CANCEL,
    refetchOptions,
  );
  const [deliveredMutation, deliveredState] = useMutation(
    SALES_POS_ORDER_PAPA_MARK_DELIVERED,
    refetchOptions,
  );
  const [approveMutation, approveState] = useMutation(
    SALES_POS_ORDER_PAPA_APPROVE_PHOTO,
    refetchOptions,
  );
  const [payMutation, payState] = useMutation(SALES_POS_ORDER_PAPA_PAY, {
    ...refetchOptions,
    refetchQueries: [
      ...refetchOptions.refetchQueries,
      { query: SALES_PAPA_WALLET },
    ],
  });

  const run = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> => {
    try {
      await action();
      toast({ title: t('success'), description: successMessage });
      return true;
    } catch (cause) {
      toast({
        title: t('error'),
        description: errorMessage(cause),
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    order,
    delivery,
    deal,
    loading,
    error,
    busy:
      quoteState.loading ||
      sendState.loading ||
      refreshState.loading ||
      cancelState.loading ||
      approveState.loading ||
      deliveredState.loading ||
      payState.loading,
    quote: (variables: {
      toLocationId: string;
      toAddress: string;
      toLatitude: string;
      toLongitude: string;
      size: string;
    }) =>
      run(
        () => quoteMutation({ variables: { id: orderId, ...variables } }),
        t('papa-quoted', 'Delivery price received'),
      ),
    send: (variables: {
      receiverName?: string;
      receiverPhone: string;
      description?: string;
      receiverPays: boolean;
    }) =>
      run(
        () => sendMutation({ variables: { id: orderId, ...variables } }),
        t('papa-sent', 'Sent to Papa; looking for a driver'),
      ),
    refresh: () =>
      run(
        () => refreshMutation({ variables: { id: orderId } }),
        t('papa-refreshed', 'Delivery status updated'),
      ),
    cancel: (reason?: string) =>
      run(
        () => cancelMutation({ variables: { id: orderId, reason } }),
        t('papa-cancelled', 'Delivery cancelled'),
      ),
    markDelivered: () =>
      run(
        () => deliveredMutation({ variables: { id: orderId } }),
        t('papa-marked-delivered', 'Delivery marked as delivered'),
      ),
    // DTS settles its own delivery fee with Papa; the customer is not involved.
    payFee: (method: 'wallet' | 'outside') =>
      run(
        () => payMutation({ variables: { id: orderId, method } }),
        method === 'wallet'
          ? t('papa-fee-paid-wallet', 'Papa fee paid from the wallet')
          : t(
              'papa-fee-paid-outside',
              'Papa fee recorded as paid outside Papa',
            ),
      ),
    approvePhoto: () =>
      run(
        () => approveMutation({ variables: { id: orderId } }),
        t('papa-photo-approved', 'Delivery photo approved'),
      ),
  };
};
