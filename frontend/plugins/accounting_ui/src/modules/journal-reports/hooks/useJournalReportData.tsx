import { OperationVariables, useQuery } from '@apollo/client';
import { JOURNAL_REPORT_QUERY } from '../graphql/reportQueries';
import { useJouranlReportVariables } from './useJournalReportVars';
import { IJournalReport } from '../types/journalReport';

export const useJournalReportData = (options?: OperationVariables) => {
  const variables = useJouranlReportVariables(options?.variables);

  const { data, loading, error } = useQuery<{
    journalReportData: {
      grouped: IJournalReport;
    };
  }>(JOURNAL_REPORT_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
  });

  const { grouped } = data?.journalReportData ?? {};

  return {
    loading,
    grouped,
    error,
  };
};
