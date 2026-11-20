import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'erxes-ui';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import {
  exportReportExcel,
  REPORT_EXCEL_EMPTY,
  ReportExcelCell,
} from '@/tunable-reports/exportReportExcel';
import { useReportTranslation } from '@/tunable-reports/locales';
import { ReportOrganization } from '@/tunable-reports/reportText';
import { ReportRunSettings } from '@/tunable-reports/runReport';
import { reportValues, sortReportValues } from '@/tunable-reports/values';
import { notifyMutationResult } from '@/utils/graphqlMutation';
import { AccountingTunableReportFieldsFragment } from '~/gql/graphql';

export const ReportExcelButton = ({
  report,
  cells,
  settings,
  organization,
  disabled,
}: {
  report?: AccountingTunableReportFieldsFragment;
  cells?: ReportExcelCell[];
  settings?: ReportRunSettings;
  organization?: ReportOrganization;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { t: reportT } = useReportTranslation();
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    if (!report || !settings) return;
    setExporting(true);
    try {
      await exportReportExcel({
        values: sortReportValues(reportValues(report)),
        cells: cells ?? [],
        settings,
        organization,
        labels: { number: reportT('number'), name: reportT('name') },
      });
      notifyMutationResult(true, t('report-downloaded-as-an-excel-file'));
    } catch (error) {
      notifyMutationResult(
        false,
        error instanceof Error && error.message === REPORT_EXCEL_EMPTY
          ? t('no-report-data-available-to-download')
          : t('unable-to-generate-the-excel-file'),
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || exporting || !report || !settings}
      onClick={() => void handleExport()}
    >
      <IconFileSpreadsheet />
      {exporting ? t('preparing-excel-file') : t('download-excel')}
    </Button>
  );
};
