import { IconFileSpreadsheet } from '@tabler/icons-react';
import { Button, Separator, Skeleton, useToast } from 'erxes-ui';
import { RefObject, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useJournalReportOrganizationName } from '@/journal-reports/hooks/useJournalReportOrganizationName';
import { exportJournalReportExcel } from '@/journal-reports/utils/exportJournalReportExcel';
import { formatReportPeriodQuery } from '@/journal-reports/utils/reportNavigation';
import { TAX_REPORT_TITLES, TaxReportKind } from '../types';

export const TaxReportHeader = ({
  kind,
  containerRef,
  canExport,
}: {
  kind?: TaxReportKind;
  containerRef: RefObject<HTMLDivElement>;
  canExport: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { organizationName, loading } = useJournalReportOrganizationName();
  const [exporting, setExporting] = useState(false);
  const title = t(kind ? TAX_REPORT_TITLES[kind] : 'tax-reports');
  const period = [
    formatReportPeriodQuery(searchParams.get('fromDate')),
    formatReportPeriodQuery(searchParams.get('toDate')),
  ]
    .filter(Boolean)
    .join(' - ');

  const handleExport = async () => {
    if (!containerRef.current) return;

    setExporting(true);
    try {
      await exportJournalReportExcel(containerRef.current, {
        title,
        organizationName,
        dateRange: period,
      });
      toast({
        title: t('success'),
        description: t('report-downloaded-as-an-excel-file'),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? t(error.message)
            : t('unable-to-generate-the-excel-file'),
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-[1em]">
        <h1 className="text-center text-[2em] leading-tight font-bold">
          {title}
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={exporting || loading || !canExport}
          className="print:hidden"
        >
          <IconFileSpreadsheet />
          {exporting ? t('preparing-excel-file') : t('download-excel')}
        </Button>
      </div>
      <div className="flex justify-between pb-[2em]">
        <div className="flex flex-col gap-1">
          {loading ? (
            <Skeleton className="h-[1.5em] w-40" />
          ) : (
            <p className="min-h-[1.5em] font-bold">{organizationName}</p>
          )}
          <Separator className="bg-border print:bg-foreground" />
          <p>{t('organization-name')}</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p>{period}</p>
          <p>{t('in-mnt')}</p>
        </div>
      </div>
    </>
  );
};
