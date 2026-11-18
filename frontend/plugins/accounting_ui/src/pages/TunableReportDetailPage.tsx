import { ReactNode, useState } from 'react';
import { ReportRunSheet } from '@/tunable-reports/ReportRunSheet';
import { useQuery } from '@apollo/client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Spinner } from 'erxes-ui';
import { IconReportAnalytics, IconTrash } from '@tabler/icons-react';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { REPORT_DETAIL } from '@/tunable-reports/graphql';
import { ReportEditor } from '@/tunable-reports/ReportEditor';
import { ReportPreview } from '@/tunable-reports/ReportPreview';
import { useReportTranslation } from '@/tunable-reports/locales';
import { useReportActions } from '@/tunable-reports/useReports';

export const TunableReportDetailPage = ({
  mode,
}: {
  mode: 'new' | 'edit' | 'show';
}) => {
  const [runOpen, setRunOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useReportTranslation();
  const { canManage, canRemove, removing, removeReport } = useReportActions();
  const { data, loading, error, refetch } = useQuery(REPORT_DETAIL, {
    variables: { _id: id || '' },
    skip: mode === 'new',
    fetchPolicy: 'cache-and-network',
  });
  const report = data?.accountingTunableReportDetail;
  const header = (editorActions?: ReactNode) => (
    <AccountingHeader
      returnLink="/accounting/tunable-reports"
      returnText={t('title')}
      icon={IconReportAnalytics}
    >
      {report && mode === 'show' && canManage && (
        <Button asChild variant="outline">
          <Link to={`/accounting/tunable-reports/${report._id}/edit`}>
            {t('edit')}
          </Link>
        </Button>
      )}
      {report && mode !== 'new' && (
        <Button variant="outline" onClick={() => setRunOpen(true)}>
          {t('run')}
        </Button>
      )}
      {report && mode !== 'new' && canRemove && (
        <Button
          type="button"
          variant="destructive"
          disabled={removing}
          onClick={async () => {
            if (await removeReport(report))
              navigate('/accounting/tunable-reports');
          }}
        >
          {removing ? <Spinner /> : <IconTrash />}
          {t('remove')}
        </Button>
      )}
      {editorActions}
    </AccountingHeader>
  );
  const editorReport = mode === 'edit' ? report : undefined;
  const showEditor = !error && (mode === 'new' || !!editorReport);
  return (
    <AccountingLayout>
      {showEditor ? (
        <ReportEditor
          key={editorReport?._id ?? 'new'}
          report={editorReport}
          renderLayout={(actions, body) => (
            <>
              {header(actions)}
              <div className="flex-auto overflow-auto">{body}</div>
            </>
          )}
        />
      ) : (
        <>
          {header()}
          <div className="flex-auto overflow-auto">
            {loading && !report && (
              <div className="p-6">
                <Spinner />
              </div>
            )}
            {error && (
              <div role="alert" className="p-6">
                {error.message}
                <Button variant="outline" onClick={() => void refetch()}>
                  {t('retry')}
                </Button>
              </div>
            )}
            {!error && report && mode === 'show' && (
              <ReportPreview report={report} />
            )}
          </div>
        </>
      )}
      {report && runOpen && (
        <ReportRunSheet
          report={report}
          open={runOpen}
          onOpenChange={setRunOpen}
        />
      )}
    </AccountingLayout>
  );
};
