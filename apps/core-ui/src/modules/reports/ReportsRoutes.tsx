import { IconChartFunnel, type TablerIcon } from '@tabler/icons-react';
import { AppLayout, cn, PageContainer, ScrollArea, Select, Sidebar, Skeleton, useQueryState } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { messageOf } from '~/lib/api';
import { LeadOwners, LeadReasons, LeadSources, LeadStageFunnel, LeadSummary, REPORT_RANGES, useLeadReportFor } from './leads/leadReportParts';

/** The reports the app lists; plugins will add theirs here. */
const REPORTS: { path: string; label: string; icon: TablerIcon }[] = [{ path: 'leads', label: 'Leads', icon: IconChartFunnel }];

const ReportsNavigation = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {REPORTS.map(({ path, label, icon: Icon }) => (
            <Sidebar.MenuItem key={path}>
              <Sidebar.MenuButton asChild className="px-2" isActive={pathname.startsWith(`/reports/${path}`)}>
                <Link to={`/reports/${path}`}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

export const ReportSection = ({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) => (
  <section className={cn('flex flex-col gap-3 rounded-lg border bg-background p-4', className)}>
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

/**
 * Reports › Leads: how many leads came, how many became customers, how long
 * it took, where good ones come from, who converts them, why others were lost.
 * People or companies (`?kind=companies`), over a period (`?days=`).
 */
export const LeadsReportPage = ({ inContacts = false }: { inContacts?: boolean }) => {
  const [kind, setKind] = useQueryState<string>('kind');
  const [daysParam, setDays] = useQueryState<string>('days');
  const recordType = kind === 'companies' ? 'company' : 'customer';
  const days = REPORT_RANGES.some((range) => range.value === daysParam) ? daysParam! : '30';
  const { data: report, error, isPending } = useLeadReportFor(recordType, Number(days));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={
              inContacts
                ? [{ label: 'Leads', to: '/contacts/leads', icon: IconChartFunnel }, { label: 'Insights', to: '/contacts/leads/insights' }]
                : [{ label: 'Reports', to: '/reports', icon: IconChartFunnel }, { label: 'Leads', to: '/reports/leads' }]
            }
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Select value={recordType} onValueChange={(next) => setKind(next === 'company' ? 'companies' : null)}>
            <Select.Trigger className="h-8 w-32">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="customer">People</Select.Item>
              <Select.Item value="company">Companies</Select.Item>
            </Select.Content>
          </Select>
          <Select value={days} onValueChange={(next) => setDays(next === '30' ? null : next)}>
            <Select.Trigger className="h-8 w-40">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {REPORT_RANGES.map((range) => (
                <Select.Item key={range.value} value={range.value}>
                  {range.label}
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
            <>
              <LeadSummary report={report} />
              <ReportSection title="Stages" description="Leads in each stage now, how many reached it in the period, and how long they stayed.">
                <LeadStageFunnel report={report} />
              </ReportSection>
              <div className="grid gap-4 md:grid-cols-2">
                <ReportSection title="Sources" description="The period’s new leads by where they came from.">
                  <LeadSources report={report} />
                </ReportSection>
                <ReportSection title="Owners" description="The period’s new leads by owner.">
                  <LeadOwners report={report} />
                </ReportSection>
              </div>
              <ReportSection title="Why leads were lost" description="Reasons given when disqualifying, most common first.">
                <LeadReasons report={report} />
              </ReportSection>
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

/** The Reports app, mounted at `reports/*`: one place for every module's reports. */
export const ReportsRoutes = () => (
  <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
    <AppLayout id="reports" title="Reports" sidebar={<ReportsNavigation />}>
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
