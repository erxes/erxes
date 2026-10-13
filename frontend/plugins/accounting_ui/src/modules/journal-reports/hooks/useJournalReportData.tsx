import { parseReportRecords } from '../utils/reportRecords';
import type {
  AccountingJournalReportDataQuery,
  AccountingJournalReportDataQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { JOURNAL_REPORT_QUERY } from '../graphql/reportQueries';

import { useJouranlReportVariables } from './useJournalReportVars';

export const useJournalReportData = (
  options?: QueryHookOptions<
    AccountingJournalReportDataQuery,
    AccountingJournalReportDataQueryVariables
  >,
) => {
  const variables = useJouranlReportVariables(options?.variables);

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(JOURNAL_REPORT_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
  });
  const data = toGraphqlView(queryData);

  const { records } = data?.journalReportData || {};

  return {
    loading,
    records: parseReportRecords(records),
    error,
  };
};
