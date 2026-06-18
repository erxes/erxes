import { OperationVariables, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useEffect } from 'react';
import {
  INVOICE_SCANNED_SUBSCRIPTION,
  INVOICES,
} from '~/modules/payment/graphql/queries';

export const INVOICES_CURSOR_SESSION_KEY = 'invoices-cursor';
const LIMIT = 20;

export const useInvoices = (options?: OperationVariables) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: INVOICES_CURSOR_SESSION_KEY,
  });

  const [queries] = useMultiQueryState<{
    searchValue?: string;
    status?: string;
    kind?: string;
  }>(['searchValue', 'status', 'kind']);

  const { data, error, loading, fetchMore, subscribeToMore } = useQuery(
    INVOICES,
    {
      variables: {
        searchValue: queries?.searchValue,
        status: queries?.status,
        kind: queries?.kind,
        limit: LIMIT,
        cursor,
        ...options?.variables,
      },
      fetchPolicy: 'network-only',
      ...options,
    },
  );

  useEffect(() => {
    return subscribeToMore({
      document: INVOICE_SCANNED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const scanned = subscriptionData?.data?.invoiceScanned;
        if (!scanned) return prev;

        const list = prev?.invoices?.list || [];
        const updated = list.map((inv: any) =>
          inv._id === scanned._id ? { ...inv, ...scanned } : inv,
        );

        return {
          ...prev,
          invoices: {
            ...prev.invoices,
            list: updated,
          },
        };
      },
    });
  }, [subscribeToMore]);

  const invoices = data?.invoices?.list || [];
  const totalCount = data?.invoices?.totalCount || 0;
  const pageInfo: IRecordTableCursorPageInfo | undefined =
    data?.invoices?.pageInfo || undefined;

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        ...options?.variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: LIMIT,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          invoices: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.invoices,
            prevResult: prev.invoices,
          }),
        });
      },
    });
  };

  return {
    invoices,
    totalCount,
    pageInfo,
    handleFetchMore,
    error,
    loading,
  };
};
