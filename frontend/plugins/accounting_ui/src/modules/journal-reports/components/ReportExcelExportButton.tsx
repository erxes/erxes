import { IconFileSpreadsheet } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, useQueryState, useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState, type RefObject } from 'react';
import { currentOrganizationState } from 'ui-modules';
import { ReportRules } from '../types/reportsMap';
import { exportJournalReportExcel } from '../utils/exportJournalReportExcel';

interface IReportExcelExportButtonProps {
  reportContainerRef: RefObject<HTMLDivElement>;
}

const formatQueryDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) {
    return '';
  }

  return format(new Date(value), 'yyyy-MM-dd');
};

export const ReportExcelExportButton = ({
  reportContainerRef,
}: IReportExcelExportButtonProps) => {
  const [report] = useQueryState('report');
  const [fromDate] = useQueryState('fromDate');
  const [toDate] = useQueryState('toDate');
  const organization = useAtomValue(currentOrganizationState);
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const reportCode = typeof report === 'string' ? report : '';
  const title = ReportRules[reportCode]?.title || 'Accounting report';

  const handleExport = async () => {
    if (!reportContainerRef.current) {
      return;
    }

    setExporting(true);
    try {
      await exportJournalReportExcel(reportContainerRef.current, {
        title,
        organizationName: organization?.name || '',
        dateRange: [formatQueryDate(fromDate), formatQueryDate(toDate)]
          .filter(Boolean)
          .join(' - '),
      });
      toast({
        title: 'Амжилттай',
        description: 'Тайланг Excel файлаар татлаа',
      });
    } catch (error) {
      toast({
        title: 'Алдаа',
        description:
          error instanceof Error
            ? error.message
            : 'Excel файл үүсгэж чадсангүй',
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
      disabled={exporting || !reportCode}
      className="print:hidden"
    >
      <IconFileSpreadsheet />
      {exporting ? 'Excel бэлдэж байна...' : 'Excel татах'}
    </Button>
  );
};
