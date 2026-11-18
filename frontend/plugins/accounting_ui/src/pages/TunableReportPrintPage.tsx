import { useQuery } from '@apollo/client';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Spinner } from 'erxes-ui';
import { IconPrinter } from '@tabler/icons-react';
import { REPORT_GENERATE } from '@/tunable-reports/graphql';
import { ReportPreview } from '@/tunable-reports/ReportPreview';
import { parseReportRunSettings } from '@/tunable-reports/runReport';
import { useReportTranslation } from '@/tunable-reports/locales';
import { useJournalReportOrganizationName } from '@/journal-reports/hooks/useJournalReportOrganizationName';

export const TunableReportPrintPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useReportTranslation();
  const settings = parseReportRunSettings(params, t);
  const { organizationName, loading: organizationLoading } =
    useJournalReportOrganizationName();
  const { data, loading, error, refetch } = useQuery(REPORT_GENERATE, {
    variables: {
      _id: id || '',
      ...(settings.success ? settings.data : { fromDate: '', toDate: '' }),
    },
    skip: !id || !settings.success,
    fetchPolicy: 'network-only',
  });
  const result = data?.accountingTunableReportGenerate;
  const report = result?.report;
  const orientation =
    report?.orientation === 'landscape' ? 'landscape' : 'portrait';
  const renderContent = () => {
    if (!settings.success)
      return (
        <p role="alert" className="p-6">
          {t('dateError')}
        </p>
      );
    if (error)
      return (
        <div role="alert" className="p-6">
          {error.message}
          <Button variant="outline" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        </div>
      );
    if (report)
      return (
        <ReportPreview
          report={report}
          settings={settings.data}
          cells={result?.cells}
          organizationName={organizationName}
        />
      );
    if (loading)
      return (
        <div className="p-6">
          <Spinner />
        </div>
      );
    return <p className="p-6">{t('empty')}</p>;
  };
  return (
    <div className="h-dvh overflow-auto bg-muted print:h-auto print:overflow-visible print:bg-white">
      <style>{`@page { size: A4 ${orientation}; margin: 10mm; } @media print { body { background: white; } .report-paper thead { display: table-header-group; } .report-paper tr { break-inside: avoid; } .report-paper table { font-size: 10pt; } }`}</style>
      <div className="sticky top-0 z-10 flex justify-between gap-2 border-b bg-background p-3 print:hidden">
        <Button asChild variant="outline">
          <Link to="/accounting/tunable-reports">{t('back')}</Link>
        </Button>
        <Button
          disabled={
            !report ||
            loading ||
            organizationLoading ||
            !!error ||
            !settings.success
          }
          onClick={() => globalThis.print()}
        >
          <IconPrinter />
          {t('print')}
        </Button>
      </div>
      {renderContent()}
    </div>
  );
};
