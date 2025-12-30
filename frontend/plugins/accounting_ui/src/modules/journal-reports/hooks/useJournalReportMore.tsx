import { OperationVariables, useQuery } from '@apollo/client';
import { JOURNAL_REPORT_MORE_QUERY } from '../graphql/reportQueries';
import { useJouranlReportVariables } from './useJournalReportVars';

export const useJournalReportMore = (options?: OperationVariables) => {
  const variables = useJouranlReportVariables(options?.variables);

  const isMore = variables.isMore;

  const { data, loading, error } = useQuery<{
    journalReportMore: {
      trDetails: any[];
    };
  }>(JOURNAL_REPORT_MORE_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
    skip: !isMore,
  });

  const { trDetails } = data?.journalReportMore || {};

  return {
    loading,
    trDetails,
    error,
  };
};
