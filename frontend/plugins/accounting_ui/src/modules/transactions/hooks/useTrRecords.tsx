import { OperationVariables, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  validateFetchMore
} from 'erxes-ui';
import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../types/constants';
import { ITrRecord } from '../types/Transaction';
import { useTransactionsVariables } from './useTransactionVars';

export const useTrRecords = (options?: OperationVariables) => {
  const variables = useTransactionsVariables(options?.variables);
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
