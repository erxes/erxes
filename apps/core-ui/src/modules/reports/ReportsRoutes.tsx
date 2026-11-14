import { z } from 'zod';
import type { LeadReport } from '@erxes/core-contract';
import { IconChartFunnel, type TablerIcon } from '@tabler/icons-react';
import {
  AppLayout,
  cn,
  PageContainer,
  ScrollArea,
  Select,
  Sidebar,
  Skeleton,
  useQueryState,
  PageHeader,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { messageOf } from '~/lib/api';
import {
  LeadOwners,
  LeadReasons,
  LeadSources,
  LeadStageFunnel,
  LeadSummary,
  REPORT_RANGES,
  useLeadReportFor,
} from './leads/leadReportParts';
import { useLeadsT } from '~/modules/leads/i18n';

/** The reports the app lists; plugins will add theirs here. */
const REPORTS: { path: string; label: string; icon: TablerIcon }[] = [
  { path: 'leads', label: 'report.leads', icon: IconChartFunnel },
];

const ReportsNavigation = () => {
  const { pathname } = useLocation();
  const t = useLeadsT();

  return (
    <Sidebar.Group variant="flush">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {REPORTS.map(({ path, label, icon: Icon }) => (
            <Sidebar.MenuItem key={path}>
              <Sidebar.MenuButton
                isActive={pathname.startsWith(`/reports/${path}`)}
                render={<Link to={`/reports/${path}`} />}
              >
                <Icon />
                <span>{t(label)}</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

const ReportSection = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('flex flex-col gap-3 rounded-lg border bg-background p-4', className)}>
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

/** The summary, then stages, sources, owners and reasons for losing. */
const LeadReportSections = ({ report }: { report: LeadReport }) => {
  const t = useLeadsT();

  return (
    <>
      <LeadSummary report={report} />
      <ReportSection title={t('report.stages')} description={t('report.stages-description')}>
        <LeadStageFunnel report={report} />
      </ReportSection>
      <div className="grid gap-4 md:grid-cols-2">
        <ReportSection title={t('report.sources')} description={t('report.sources-description')}>
          <LeadSources report={report} />
        </ReportSection>
        <ReportSection title={t('report.owners')} description={t('report.owners-description')}>
          <LeadOwners report={report} />
        </ReportSection>
      </div>
      <ReportSection title={t('report.lost')} description={t('report.lost-description')}>
        <LeadReasons report={report} />
      </ReportSection>
    </>
  );
};

/**
 * Reports › Leads: how many leads came, how many became customers, how long
 * it took, where good ones come from, who converts them, why others were lost.
 * People or companies (`?kind=companies`), over a period (`?days=`).
 */
export const LeadsReportPage = ({ inContacts = false }: { inContacts?: boolean }) => {
  const t = useLeadsT();
  const [kind, setKind] = useQueryState('kind', z.string());
  const [daysParam, setDays] = useQueryState('days', z.string());
  const recordType = kind === 'companies' ? 'company' : 'customer';
  const days = REPORT_RANGES.find((range) => range === daysParam) ?? '30';
  const { data: report, error, isPending } = useLeadReportFor(recordType, Number(days));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={
              inContacts
                ? [
                    {
                      label: t('report.leads'),
                      to: '/contacts/leads',
                      icon: IconChartFunnel,
                    },
                    { label: t('insights'), to: '/contacts/leads/insights' },
                  ]
                : [
                    {
                      label: t('report.reports'),
                      to: '/reports',
                      icon: IconChartFunnel,
                    },
                    { label: t('report.leads'), to: '/reports/leads' },
                  ]
            }
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Select
            value={recordType}
            onValueChange={(next) => setKind(next === 'company' ? 'companies' : null)}
          >
            <Select.Trigger className="h-8 w-32">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="customer">{t('people')}</Select.Item>
              <Select.Item value="company">{t('companies')}</Select.Item>
            </Select.Content>
          </Select>
          <Select value={days} onValueChange={(next) => setDays(next === '30' ? null : next)}>
            <Select.Trigger className="h-8 w-40">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {REPORT_RANGES.map((range) => (
                <Select.Item key={range} value={range}>
                  {t(`report.ranges.${range}`)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
          {error && <p className="text-sm text-destructive">{messageOf(error)}</p>}
          {isPending || !report ? (
            <Skeleton className="h-96" />
          ) : (
            <LeadReportSections report={report} />
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

/** The Reports app, mounted at `reports/*`: one place for every module's reports. */
export const ReportsRoutes = () => {
  const t = useLeadsT();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <AppLayout id="reports" title={t('report.reports')} sidebar={<ReportsNavigation />}>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Routes>
            <Route index element={<Navigate to="leads" replace />} />
            <Route path="leads" element={<LeadsReportPage />} />
            <Route path="*" element={<Navigate to="leads" replace />} />
          </Routes>
        </div>
      </AppLayout>
    </div>
  );
};
