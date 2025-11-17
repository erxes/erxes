import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { ACC_TR_RECORDS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { ACC_TRS__PER_PAGE } from '../types/constants';
import { EnumCursorDirection, ICursorListResponse, IRecordTableCursorPageInfo, mergeCursorData, useMultiQueryState, useRecordTableCursor, validateFetchMore } from 'erxes-ui';
import { ITrRecord } from '../types/Transaction';

export const useTrRecordsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ITrRecord>>['variables'],
) => {
  const [queryParams] =
    useMultiQueryState<{
      searchValue?: string;
      code?: string;
      name?: string;
      categoryId?: string;
      currency?: string;
      kind?: string;
      journal?: string;

    }>(['code', 'name', 'categoryId', 'currency', 'kind', 'journal', 'searchValue']);

  const { cursor } = useRecordTableCursor({
    sessionKey: ACC_TR_RECORDS_CURSOR_SESSION_KEY,
  });

  const curVariables = Object.entries(queryParams).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value + '';
    } return acc;
  }, {} as Record<string, string>);

  return {
    limit: ACC_TRS__PER_PAGE,
    orderBy: {
      date: 1
    },
    cursor,
    ...variables,
    ...curVariables
  };
};

export const useTrRecords = (options?: OperationVariables) => {
  const variables = useTrRecordsVariables(options?.variables);
  const { data, loading, error, fetchMore } = useQuery<{
    accTrRecordsMain: {
      list: ITrRecord[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(TR_RECORDS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
  });

  const { list: trRecords, totalCount, pageInfo } = data?.accTrRecordsMain || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: ACC_TRS__PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          accTrRecordsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.accTrRecordsMain,
            prevResult: prev.accTrRecordsMain,
          }),
        });
      },
    });
  };
  return {
    loading,
    trRecords,
    totalCount,
    error,
    handleFetchMore,
    pageInfo,
  };
};
