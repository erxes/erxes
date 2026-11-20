import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  IconReportAnalytics,
  IconPlus,
  IconReport,
  IconEdit,
} from '@tabler/icons-react';
import { Badge, Button, Card, Input, Skeleton } from 'erxes-ui';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { REPORT_LIST } from '@/tunable-reports/graphql';
import { ReportRunSheet } from '@/tunable-reports/ReportRunSheet';
import { useReportTranslation } from '@/tunable-reports/locales';
import { useReportActions } from '@/tunable-reports/useReports';

type SelectedReport = { _id: string; name: string };
export const TunableReportsPage = () => {
  const { t } = useReportTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SelectedReport>();
  const { canManage } = useReportActions();
  const { data, loading, error, refetch } = useQuery(REPORT_LIST, {
    variables: { searchValue, page, perPage: 20 },
    fetchPolicy: 'cache-and-network',
  });
  const reports = data?.accountingTunableReports.list ?? [];
  const total = data?.accountingTunableReports.totalCount ?? 0;
  const add = (
    <Button asChild>
      <Link to="/accounting/tunable-reports/new">
        <IconPlus />
        {t('add')}
      </Link>
    </Button>
  );
  const renderReports = () => {
    if (error) return <AccountingEmptyState error={error} />;
    if (loading && !data)
      return (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label={t('loading')}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      );
    if (!reports.length)
      return (
        <AccountingEmptyState
          title={t('empty')}
          description={t('emptyDescription')}
          action={add}
        />
      );
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label={t('title')}
      >
        {reports.map((report) => (
          <Card
            key={report._id}
            className="flex min-w-0 flex-col border border-border/70 shadow-none"
          >
            <Card.Header className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="w-fit font-mono">
                  {report.code}
                </Badge>
                {report.status === 'archived' && (
                  <Badge variant="warning">{t('archived')}</Badge>
                )}
              </div>
              <Card.Title
                className="line-clamp-2 text-base leading-relaxed"
                title={report.name}
              >
                {report.name}
              </Card.Title>
            </Card.Header>
            <Card.Footer className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSelected(report)}
              >
                <IconReport />
                {t('run')}
              </Button>
              {canManage && (
                <Button asChild variant="ghost">
                  <Link to={`/accounting/tunable-reports/${report._id}/edit`}>
                    <IconEdit />
                    {t('edit')}
                  </Link>
                </Button>
              )}
            </Card.Footer>
          </Card>
        ))}
      </div>
    );
  };
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/tunable-reports"
        returnText={t('title')}
        icon={IconReportAnalytics}
      >
        {add}
      </AccountingHeader>
      <div className="flex items-center gap-3 px-3 py-2">
        <Input
          aria-label={t('search')}
          placeholder={t('search')}
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          {total} {t('records')}
        </span>
        {error && (
          <Button variant="outline" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">{renderReports()}</div>
      <div className="flex justify-end gap-2 p-3">
        <Button
          variant="outline"
          disabled={page <= 1 || loading}
          onClick={() => setPage((value) => value - 1)}
        >
          {t('previousPage')}
        </Button>
        <Button
          variant="outline"
          disabled={page * 20 >= total || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          {t('nextPage')}
        </Button>
      </div>
      {selected && (
        <ReportRunSheet
          key={selected._id}
          report={selected}
          open
          onOpenChange={(open) => !open && setSelected(undefined)}
        />
      )}
    </AccountingLayout>
  );
};
