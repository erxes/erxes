import { OperationVariables, useQuery } from '@apollo/client';
import { JOURNAL_REPORT_MORE_QUERY } from '../graphql/reportQueries';
import { useJouranlReportVariables } from './useJournalReportVars';
import { EnumCursorDirection, IRecordTableCursorPageInfo, mergeCursorData, validateFetchMore } from 'erxes-ui';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';

export const useJournalReportMore = (options?: OperationVariables) => {
  const variables = useJouranlReportVariables(options?.variables);

  const isMore = variables.isMore;

  const { data, loading, error, fetchMore } = useQuery<{
    journalReportMore: {
      trDetails: any[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(JOURNAL_REPORT_MORE_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
    skip: !isMore,
  });

  const { trDetails, pageInfo } = data?.journalReportMore || {};

  const loopFetchMore = ({
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
          journalReportMore: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.journalReportMore,
            prevResult: prev.journalReportMore,
          }),
        });
      },
    });
  };

  return {
    loading,
    trDetails,
    loopFetchMore,
    error,
  };
};
