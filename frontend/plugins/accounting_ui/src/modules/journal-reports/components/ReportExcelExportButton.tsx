import { useTranslation } from 'react-i18next';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { Button, useQueryState, useToast } from 'erxes-ui';
import { useState, type RefObject } from 'react';
import { useJournalReportOrganizationName } from '@/journal-reports/hooks/useJournalReportOrganizationName';
import { formatReportPeriodQuery } from '@/journal-reports/utils/reportNavigation';
import { ReportRules } from '../types/reportsMap';
import { exportJournalReportExcel } from '../utils/exportJournalReportExcel';

interface IReportExcelExportButtonProps {
  reportContainerRef: RefObject<HTMLDivElement>;
}

export const ReportExcelExportButton = ({
  reportContainerRef,
}: IReportExcelExportButtonProps) => {
  const { t } = useTranslation('accounting');
  const [report] = useQueryState<string>('report');
  const [fromDate] = useQueryState<string>('fromDate');
  const [toDate] = useQueryState<string>('toDate');
  const { organizationName, loading } = useJournalReportOrganizationName();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const reportCode = typeof report === 'string' ? report : '';
  const title = t(ReportRules[reportCode]?.title || 'Accounting report');

  const handleExport = async () => {
    if (!reportContainerRef.current) {
      return;
    }

    setExporting(true);
    try {
      await exportJournalReportExcel(reportContainerRef.current, {
        title,
        organizationName,
        dateRange: [
          formatReportPeriodQuery(fromDate),
          formatReportPeriodQuery(toDate),
        ]
          .filter(Boolean)
          .join(' - '),
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
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={exporting || loading || !reportCode}
      className="print:hidden"
    >
      <IconFileSpreadsheet />
      {exporting ? t('preparing-excel-file') : t('download-excel')}
    </Button>
  );
};
