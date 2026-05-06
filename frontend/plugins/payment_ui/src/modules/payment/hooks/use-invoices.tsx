import { OperationVariables, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { INVOICES } from '~/modules/payment/graphql/queries';

export const INVOICES_CURSOR_SESSION_KEY = 'invoices-cursor';
const LIMIT = 20;

export const useInvoices = (options?: OperationVariables) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: INVOICES_CURSOR_SESSION_KEY,
  });

  const [queries] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);

  const { data, error, loading, fetchMore } = useQuery(INVOICES, {
    variables: {
      searchValue: queries?.searchValue,
      limit: LIMIT,
      cursor,
      ...options?.variables,
    },
    fetchPolicy: 'network-only',
    ...options,
  });

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
