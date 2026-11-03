import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentOrganizationState } from 'ui-modules';
import { JOURNAL_REPORT_ORGANIZATION_QUERY } from '@/journal-reports/graphql/reportQueries';

export const useJournalReportOrganizationName = () => {
  const currentOrganization = useAtomValue(currentOrganizationState);
  const { data, loading } = useQuery(JOURNAL_REPORT_ORGANIZATION_QUERY);

  const organizationName =
    data?.structureDetail?.title?.trim() ||
    currentOrganization?.name?.trim() ||
    '';

  return { organizationName, loading };
};
