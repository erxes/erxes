import { parseReportRecords } from '../utils/reportRecords';

import type {
  AccountingJournalReportMoreQuery,
  AccountingJournalReportMoreQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { JOURNAL_REPORT_MORE_QUERY } from '../graphql/reportQueries';
import { useJouranlReportVariables } from './useJournalReportVars';

export const useJournalReportMore = (
  options?: QueryHookOptions<
    AccountingJournalReportMoreQuery,
    AccountingJournalReportMoreQueryVariables
  >,
) => {
  const variables = useJouranlReportVariables(options?.variables);

  const isMore = variables.isMore;

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(JOURNAL_REPORT_MORE_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
    skip: !isMore,
  });
  const data = toGraphqlView(queryData);

  const trDetails = parseReportRecords(data?.journalReportMore?.trDetails);

  return {
    loading,
    trDetails,
    error,
  };
};
