import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentOrganizationState } from 'ui-modules';
import { JOURNAL_REPORT_ORGANIZATION_QUERY } from '@/journal-reports/graphql/reportQueries';

export const useJournalReportOrganizationName = (): string => {
  const currentOrganization = useAtomValue(currentOrganizationState);
  const { data } = useQuery(JOURNAL_REPORT_ORGANIZATION_QUERY);

  return (
    data?.structureDetail?.title?.trim() ||
    currentOrganization?.name?.trim() ||
    ''
  );
};
