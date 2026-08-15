import { OperationVariables, useQuery } from '@apollo/client';
import { JOURNAL_REPORT_QUERY } from '../graphql/reportQueries';
import { IJournalReportRecord } from '../types/journalReport';
import { useJouranlReportVariables } from './useJournalReportVars';

export const useJournalReportData = (options?: OperationVariables) => {
  const variables = useJouranlReportVariables(options?.variables);

  const { data, loading, error } = useQuery<{
    journalReportData: {
      records: IJournalReportRecord[];
    };
  }>(JOURNAL_REPORT_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
  });

  const { records } = data?.journalReportData || {};

  return {
    loading,
    records,
    error,
  };
};
