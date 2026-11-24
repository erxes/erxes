import { useMemo } from 'react';
import { useJournalReportOrganizationName } from '@/journal-reports/hooks/useJournalReportOrganizationName';
import { ReportOrganization } from '@/tunable-reports/reportText';

export const useReportOrganization = (): {
  organization?: ReportOrganization;
  loading: boolean;
} => {
  const { organizationName, phoneNumber, email, loading } =
    useJournalReportOrganizationName();
  const organization = useMemo(
    () =>
      loading ? undefined : { name: organizationName, phoneNumber, email },
    [organizationName, phoneNumber, email, loading],
  );
  return { organization, loading };
};
