import { OperationVariables, useQuery } from '@apollo/client';
import { JOURNAL_REPORT_MORE_QUERY } from '../graphql/reportQueries';
import { useJouranlReportVariables } from './useJournalReportVars';

export const useJournalReportMore = (options?: OperationVariables) => {
  const variables = useJouranlReportVariables(options?.variables);

  const { data, loading, error } = useQuery<{
    journalReportData: {
      records: any[];
    };
  }>(JOURNAL_REPORT_MORE_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
  });

  const { records } = data?.journalReportData || {};

  return {
    loading,
    records,
    error,
  };
};
