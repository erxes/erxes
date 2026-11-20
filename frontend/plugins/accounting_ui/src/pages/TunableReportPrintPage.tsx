import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Button, Spinner } from 'erxes-ui';
import { IconPrinter, IconReport } from '@tabler/icons-react';
import { REPORT_GENERATE } from '@/tunable-reports/graphql';
import { ReportExcelButton } from '@/tunable-reports/ReportExcelButton';
import { ReportPreview } from '@/tunable-reports/ReportPreview';
import { ReportRunSheet } from '@/tunable-reports/ReportRunSheet';
import {
  parseReportRunSettings,
  reportRunPath,
} from '@/tunable-reports/runReport';
import { useReportTranslation } from '@/tunable-reports/locales';
import { useReportOrganization } from '@/tunable-reports/useReportOrganization';

export const TunableReportPrintPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useReportTranslation();
  const [runOpen, setRunOpen] = useState(false);
  const settings = parseReportRunSettings(params, t);
  const { organization, loading: organizationLoading } =
    useReportOrganization();
  const { data, loading, error, refetch } = useQuery(REPORT_GENERATE, {
    variables: {
      _id: id || '',
      ...(settings.success ? settings.data : { fromDate: '', toDate: '' }),
    },
    skip: !id || !settings.success,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const result = data?.accountingTunableReportGenerate;
  const report = result?.report;
  const orientation =
    report?.orientation === 'landscape' ? 'landscape' : 'portrait';
  const ready =
    !!report && !loading && !organizationLoading && !error && settings.success;
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
          organization={organization}
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
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            disabled={!id}
            onClick={() => setRunOpen(true)}
          >
            <IconReport />
            {t('run')}
          </Button>
          <ReportExcelButton
            report={report}
            cells={result?.cells}
            settings={settings.success ? settings.data : undefined}
            organization={organization}
            disabled={!ready}
          />
          <Button disabled={!ready} onClick={() => globalThis.print()}>
            <IconPrinter />
            {t('print')}
          </Button>
        </div>
      </div>
      {renderContent()}
      {id && runOpen && (
        <ReportRunSheet
          report={{ _id: id, name: report?.name ?? '' }}
          open={runOpen}
          onOpenChange={setRunOpen}
          defaultValues={settings.success ? settings.data : undefined}
          onRun={(next) => {
            const path = reportRunPath(id, next);
            if (settings.success && path === reportRunPath(id, settings.data)) {
              void refetch();
              return;
            }
            navigate(path);
          }}
        />
      )}
    </div>
  );
};
