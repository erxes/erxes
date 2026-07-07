import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import {
  INVOICE_SCANNED_SUBSCRIPTION,
  INVOICES,
} from '~/modules/payment/graphql/queries';
import { invoicesTotalCountAtom } from '~/modules/payment/states/invoiceCounts';
import { IInvoice } from '~/modules/payment/types/Payment';

export const INVOICES_CURSOR_SESSION_KEY = 'invoices-cursor';
const LIMIT = 20;

interface InvoicesQueryResult {
  invoices?: {
    list?: IInvoice[];
    pageInfo?: IRecordTableCursorPageInfo;
    totalCount?: number;
  };
}

interface InvoiceScannedSubscriptionResult {
  invoiceScanned?: Partial<IInvoice> & Pick<IInvoice, '_id'>;
}

interface InvoicesQueryVariables extends OperationVariables {
  contentType?: string;
  contentTypeId?: string;
  cursor?: string;
  direction?: EnumCursorDirection;
  kind?: string;
  limit?: number;
  searchValue?: string;
  status?: string;
}

/**
 * Fetches the cursor-paginated invoice list using filters from query params
 * and keeps the invoice total count atom in sync.
 */
export const useInvoices = (
  options?: QueryHookOptions<InvoicesQueryResult, InvoicesQueryVariables>,
) => {
  const setInvoicesTotalCount = useSetAtom(invoicesTotalCountAtom);
  const { cursor } = useRecordTableCursor({
    sessionKey: INVOICES_CURSOR_SESSION_KEY,
  });

  const [queries] = useMultiQueryState<{
    searchValue?: string;
    status?: string;
    kind?: string;
  }>(['searchValue', 'status', 'kind']);

  const variables = useMemo(
    () => ({
      searchValue: queries?.searchValue ?? undefined,
      status: queries?.status ?? undefined,
      kind: queries?.kind ?? undefined,
      limit: LIMIT,
      cursor,
      ...options?.variables,
    }),
    [
      cursor,
      options?.variables,
      queries?.kind,
      queries?.searchValue,
      queries?.status,
    ],
  );

  const shouldSyncInvoiceTotalCount =
    !options?.variables?.contentType && !options?.variables?.contentTypeId;

  const { data, error, loading, fetchMore, subscribeToMore } = useQuery<
    InvoicesQueryResult,
    InvoicesQueryVariables
  >(INVOICES, {
    ...options,
    variables,
    fetchPolicy: options?.fetchPolicy || 'network-only',
  });

  useEffect(() => {
    return subscribeToMore<InvoiceScannedSubscriptionResult>({
      document: INVOICE_SCANNED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const scanned = subscriptionData?.data?.invoiceScanned;
        if (!scanned) return prev;

        const list = prev?.invoices?.list || [];
        const updated = list.map((invoice) =>
          invoice._id === scanned._id ? { ...invoice, ...scanned } : invoice,
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

  useEffect(() => {
    if (!shouldSyncInvoiceTotalCount) return;
    setInvoicesTotalCount(null);
  }, [setInvoicesTotalCount, shouldSyncInvoiceTotalCount, variables]);

  useEffect(() => {
    if (!shouldSyncInvoiceTotalCount || loading) return;
    setInvoicesTotalCount(data?.invoices?.totalCount ?? null);
  }, [
    data?.invoices?.totalCount,
    loading,
    setInvoicesTotalCount,
    shouldSyncInvoiceTotalCount,
  ]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        ...variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: LIMIT,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.invoices || !prev?.invoices) return prev;
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
