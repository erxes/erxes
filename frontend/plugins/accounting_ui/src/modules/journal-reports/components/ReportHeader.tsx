import { formatDate as format } from '@/utils/graphqlDate';
import { useTranslation } from 'react-i18next';
import { Separator, Skeleton, useQueryState } from 'erxes-ui';
import type { RefObject } from 'react';
import { useJournalReportOrganizationName } from '@/journal-reports/hooks/useJournalReportOrganizationName';
import { ReportRules } from '../types/reportsMap';
import { ReportExcelExportButton } from './ReportExcelExportButton';

interface IReportHeaderProps {
  reportContainerRef: RefObject<HTMLDivElement>;
}

const parseQueryDate = (value?: string): string => {
  if (!value) return '';

  return format(new Date(value), 'yyyy-MM-dd HH:mm');
};

export const ReportHeader = ({ reportContainerRef }: IReportHeaderProps) => {
  const { t } = useTranslation('accounting');
  const { organizationName, loading: organizationLoading } =
    useJournalReportOrganizationName();
  const [report] = useQueryState<string>('report');
  const [fromDate] = useQueryState<string>('fromDate');
  const [toDate] = useQueryState<string>('toDate');

  const title = t(ReportRules[(report as string) || '']?.title || '');
  const from = parseQueryDate(fromDate as string);
  const to = parseQueryDate(toDate as string);

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-[1em]">
        <h1 className="text-[2em] leading-tight font-bold text-center">
          {title}
        </h1>
        <div>
          <ReportExcelExportButton reportContainerRef={reportContainerRef} />
        </div>
      </div>
      <div className="flex justify-between pb-[2em]">
        <div className="flex flex-col gap-1">
          {organizationLoading ? (
            <Skeleton className="h-[1.5em] w-40" />
          ) : (
            <p className="font-bold min-h-[1.5em]">{organizationName}</p>
          )}
          <Separator className="print:bg-foreground bg-border" />
          <p>{t('organization-name')}</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p>{[from, to].filter((d) => d).join(' - ')}</p>
          <p>{t('in-mnt')}</p>
        </div>
      </div>
    </>
  );
};
