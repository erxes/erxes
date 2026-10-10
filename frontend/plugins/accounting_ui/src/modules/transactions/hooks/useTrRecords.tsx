import {
  mergeGraphqlCursorData,
  toCursorPageInfo,
} from '@/utils/graphqlCursor';
import type {
  AccountingAccTrRecordsQuery,
  AccountingAccTrRecordsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../types/constants';

import { useTransactionsVariables } from './useTransactionVars';

export const useTrRecords = (
  options?: QueryHookOptions<
    AccountingAccTrRecordsQuery,
    AccountingAccTrRecordsQueryVariables
  >,
) => {
  const variables = useTransactionsVariables(options?.variables);
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(TR_RECORDS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
  });
  const data = toGraphqlView(queryData);

  const {
    list: trRecords,
    totalCount,
    pageInfo,
  } = data?.accTrRecordsMain || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo: toCursorPageInfo(pageInfo),
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
          accTrRecordsMain: mergeGraphqlCursorData({
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
    pageInfo: toCursorPageInfo(pageInfo),
  };
};
