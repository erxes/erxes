import type { LeadRecordType, LeadReport } from '@erxes/core-contract';
import { IconChartBar, IconChartFunnel, IconCircleX, IconWorld } from '@tabler/icons-react';
import { cn, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardWidgetCard } from '~/modules/home/components/DashboardWidgetCard';
import type { TDashboardWidgetDefinition } from '~/modules/home/dashboard/types/dashboardTypes';
import { HOME_NS } from '~/modules/home/i18n';
import { messageOf } from '~/lib/api';
import { LeadReasons, LeadSources, LeadStageFunnel, LeadSummary, useLeadReportFor } from './leadReportParts';

/** People or companies, inside a tile's header. */
const KindToggle = ({ value, onChange }: { value: LeadRecordType; onChange: (value: LeadRecordType) => void }) => (
  <div className="flex rounded-md bg-muted p-0.5 text-xs">
    {(['customer', 'company'] as const).map((kind) => (
      <button
        key={kind}
        type="button"
        onClick={() => onChange(kind)}
        className={cn('rounded px-1.5 py-0.5 text-muted-foreground', value === kind && 'bg-background font-medium text-foreground shadow-xs')}
      >
        {kind === 'customer' ? 'People' : 'Companies'}
      </button>
    ))}
  </div>
);

/** A lead report tile: last 30 days, people or companies, a link to the full report. */
const leadTile = (title: string, Body: (props: { report: LeadReport }) => React.ReactNode) =>
  function LeadReportTile() {
    const [kind, setKind] = useState<LeadRecordType>('customer');
    const { data: report, error, isPending } = useLeadReportFor(kind, 30);

    return (
      <DashboardWidgetCard
        title={title}
        action={
          <div className="flex items-center gap-2">
            <KindToggle value={kind} onChange={setKind} />
            <Link to={`/reports/leads${kind === 'company' ? '?kind=companies' : ''}`} className="text-xs text-muted-foreground hover:text-foreground">
              Report
            </Link>
          </div>
        }
      >
        <div className="p-2">
          {error ? <p className="text-sm text-destructive">{messageOf(error)}</p> : isPending || !report ? <Skeleton className="h-24" /> : <Body report={report} />}
        </div>
      </DashboardWidgetCard>
    );
  };

/** Lead report tiles for the Home dashboard (the Reports app shows them full size). */
export const LEAD_REPORT_WIDGETS: TDashboardWidgetDefinition[] = [
  {
    type: 'reports.leads.summary',
    group: 'reports',
    preview: 'kpi',
    ns: HOME_NS,
    labelKey: 'widgets.lead-summary',
    descriptionKey: 'widgets.lead-summary-description',
    icon: IconChartBar,
    singleton: true,
    defaultSize: { w: 12, h: 4 },
    minSize: { w: 6, h: 3 },
    Component: leadTile('Leads, last 30 days', ({ report }) => <LeadSummary report={report} compact />),
  },
  {
    type: 'reports.leads.funnel',
    group: 'reports',
    preview: 'list',
    ns: HOME_NS,
    labelKey: 'widgets.lead-funnel',
    descriptionKey: 'widgets.lead-funnel-description',
    icon: IconChartFunnel,
    singleton: true,
    defaultSize: { w: 8, h: 7 },
    minSize: { w: 6, h: 5 },
    Component: leadTile('Lead stages', LeadStageFunnel),
  },
  {
    type: 'reports.leads.sources',
    group: 'reports',
    preview: 'list',
    ns: HOME_NS,
    labelKey: 'widgets.lead-sources',
    descriptionKey: 'widgets.lead-sources-description',
    icon: IconWorld,
    singleton: true,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    Component: leadTile('Lead sources', LeadSources),
  },
  {
    type: 'reports.leads.reasons',
    group: 'reports',
    preview: 'list',
    ns: HOME_NS,
    labelKey: 'widgets.lead-reasons',
    descriptionKey: 'widgets.lead-reasons-description',
    icon: IconCircleX,
    singleton: true,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    Component: leadTile('Why leads were lost', LeadReasons),
  },
];
