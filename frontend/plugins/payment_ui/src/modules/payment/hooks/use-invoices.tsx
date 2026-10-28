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
import { INVOICES } from '~/modules/payment/graphql/queries';
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

  const contentType = options?.variables?.contentType;
  const contentTypeId = options?.variables?.contentTypeId;

  const variables = useMemo(
    () => ({
      searchValue: queries?.searchValue ?? undefined,
      status: queries?.status ?? undefined,
      kind: queries?.kind ?? undefined,
      limit: LIMIT,
      cursor,
      contentType,
      contentTypeId,
    }),
    [
      contentType,
      contentTypeId,
      cursor,
      queries?.kind,
      queries?.searchValue,
      queries?.status,
    ],
  );

  const shouldSyncInvoiceTotalCount = !contentType && !contentTypeId;

  const { data, error, loading, fetchMore } = useQuery<
    InvoicesQueryResult,
    InvoicesQueryVariables
  >(INVOICES, {
    ...options,
    variables,
    fetchPolicy: options?.fetchPolicy || 'network-only',
  });

  const invoices = data?.invoices?.list || [];
  const totalCount = data?.invoices?.totalCount || 0;
  const pageInfo: IRecordTableCursorPageInfo | undefined =
    data?.invoices?.pageInfo || undefined;

  useEffect(() => {
    if (!shouldSyncInvoiceTotalCount) return;
    setInvoicesTotalCount(null);
  }, [
    queries?.kind,
    queries?.searchValue,
    queries?.status,
    setInvoicesTotalCount,
    shouldSyncInvoiceTotalCount,
  ]);

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
