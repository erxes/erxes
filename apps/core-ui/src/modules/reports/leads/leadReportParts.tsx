import type { LeadRecordType, LeadReport } from '@erxes/core-contract';
import { cn } from 'erxes-ui';
import { useMemo } from 'react';
import { MembersInline } from '~/modules/contacts/components/MembersInline';
import { useLeadReport } from '~/modules/leads/useLeads';
import { useLeadsT, useStageName } from '~/modules/leads/i18n';

/**
 * The lead report's pieces: drawn full size on Reports › Leads and as tiles
 * on the Home dashboard. Each takes the report; `useLeadReportFor` loads it
 * (requests for the same kind and period are shared).
 */

export const REPORT_RANGES = ['7', '30', '90', '365'] as const;

/** The report for people or companies over the last `days` days (to the minute, so tiles share it). */
export const useLeadReportFor = (recordType: LeadRecordType, days: number) => {
  const range = useMemo(() => {
    const to = new Date();

    to.setSeconds(0, 0);

    return {
      from: new Date(to.getTime() - days * 86_400_000).toISOString(),
      to: to.toISOString(),
    };
  }, [days]);

  return useLeadReport({ recordType, ...range });
};

const percent = (value: number) => `${Math.round(value * 1000) / 10}%`;

/** A headline number. */
const Stat = ({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string;
  hint?: string;
  compact?: boolean;
}) => (
  <div
    className={cn(
      'flex min-w-0 flex-col gap-1 rounded-lg',
      compact ? 'p-2' : 'border bg-background p-4',
    )}
  >
    <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
    <span className={cn('font-semibold tabular-nums', compact ? 'text-xl' : 'text-2xl')}>
      {value}
    </span>
    {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
  </div>
);

/** A thin bar from the baseline, rounded at its data end; the number sits beside it in text ink. */
const Bar = ({ value, max, title }: { value: number; max: number; title: string }) => (
  <div className="flex h-5 min-w-0 flex-1 items-center gap-2" title={title}>
    <span className="w-10 shrink-0 text-sm tabular-nums">{value.toLocaleString('en')}</span>
    <div className="h-2.5 flex-1">
      <div
        className="h-full rounded-r bg-primary"
        style={{
          width: `${max ? Math.max((value / max) * 100, value ? 1 : 0) : 0}%`,
        }}
      />
    </div>
  </div>
);

/** New leads, conversions, rate and time to convert. */
export const LeadSummary = ({ report, compact }: { report: LeadReport; compact?: boolean }) => {
  const t = useLeadsT();

  return (
    <div
      className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 md:grid-cols-4',
      )}
    >
      <Stat
        compact={compact}
        label={t('report.new-leads')}
        value={report.created.toLocaleString('en')}
      />
      <Stat
        compact={compact}
        label={t('report.became-customers')}
        value={report.converted.toLocaleString('en')}
        hint={t('report.disqualified', { count: report.disqualified })}
      />
      <Stat
        compact={compact}
        label={t('report.conversion-rate')}
        value={percent(report.conversionRate)}
        hint={t('report.of-period')}
      />
      <Stat
        compact={compact}
        label={t('report.time-to-convert')}
        value={report.daysToConvert.median === null ? '–' : `${report.daysToConvert.median} d`}
        hint={
          report.daysToConvert.average === null
            ? undefined
            : t('report.median-average', { days: report.daysToConvert.average })
        }
      />
    </div>
  );
};

/** Every stage: leads in it now, leads that reached it in the period, average stay. */
export const LeadStageFunnel = ({ report }: { report: LeadReport }) => {
  const t = useLeadsT();
  const stageName = useStageName();
  const max = Math.max(...report.stages.map((stage) => Math.max(stage.current, stage.reached)), 1);

  return (
    <div className="grid grid-cols-[minmax(90px,1fr)_2fr_2fr_64px] items-center gap-x-4 gap-y-2 text-sm">
      <span />
      <span className="text-xs text-muted-foreground">{t('report.in-it-now')}</span>
      <span className="text-xs text-muted-foreground">{t('report.reached')}</span>
      <span className="text-right text-xs text-muted-foreground">{t('report.avg-stay')}</span>
      {report.stages.map((stage) => (
        <div key={stage.stageId} className="contents">
          <span className="flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: stage.color }} />
            <span className="truncate">{stageName(stage.name)}</span>
          </span>
          <Bar value={stage.current} max={max} title={`${stage.name}: ${stage.current} now`} />
          <Bar
            value={stage.reached}
            max={max}
            title={`${stage.name}: ${stage.reached} reached it in the period`}
          />
          <span className="text-right tabular-nums text-muted-foreground">
            {stage.averageDays === null ? '–' : `${stage.averageDays} d`}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Rows "name · new leads · became customers · rate". */
const CohortTable = ({
  rows,
  label,
}: {
  rows: {
    key: React.ReactNode;
    id: string;
    count: number;
    converted: number;
  }[];
  label: string;
}) => {
  const t = useLeadsT();
  const max = Math.max(...rows.map((row) => row.count), 1);

  return rows.length ? (
    <div className="grid grid-cols-[minmax(90px,1fr)_2fr_70px_56px] items-center gap-x-3 gap-y-2 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{t('report.new-leads-column')}</span>
      <span className="text-right text-xs text-muted-foreground">{t('report.customers')}</span>
      <span className="text-right text-xs text-muted-foreground">{t('report.rate')}</span>
      {rows.map((row) => (
        <div key={row.id} className="contents">
          <span className="min-w-0 truncate capitalize">{row.key}</span>
          <Bar
            value={row.count}
            max={max}
            title={`${row.count} new leads, ${row.converted} became customers`}
          />
          <span className="text-right tabular-nums">{row.converted.toLocaleString('en')}</span>
          <span className="text-right tabular-nums text-muted-foreground">
            {percent(row.count ? row.converted / row.count : 0)}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="py-4 text-center text-sm text-muted-foreground">{t('report.no-leads')}</p>
  );
};

export const LeadSources = ({ report }: { report: LeadReport }) => {
  const t = useLeadsT();

  return (
    <CohortTable
      label={t('source')}
      rows={report.bySource.map((row) => ({
        id: row.source ?? 'none',
        key: row.source ?? t('report.unknown'),
        count: row.count,
        converted: row.converted,
      }))}
    />
  );
};

export const LeadOwners = ({ report }: { report: LeadReport }) => {
  const t = useLeadsT();

  return (
    <CohortTable
      label={t('actions.owner')}
      rows={report.byOwner.map((row) => ({
        id: row.ownerId ?? 'none',
        key: row.ownerId ? <MembersInline memberIds={[row.ownerId]} /> : t('report.no-owner'),
        count: row.count,
        converted: row.converted,
      }))}
    />
  );
};

export const LeadReasons = ({ report }: { report: LeadReport }) => {
  const t = useLeadsT();

  return report.reasons.length ? (
    <div className="flex flex-col gap-2">
      {report.reasons.map((row) => (
        <div key={row.reason} className="flex items-center gap-3 text-sm">
          <span className="w-40 shrink-0 truncate">{row.reason}</span>
          <Bar
            value={row.count}
            max={report.reasons[0]?.count ?? row.count}
            title={`${row.reason}: ${row.count}`}
          />
        </div>
      ))}
    </div>
  ) : (
    <p className="py-4 text-center text-sm text-muted-foreground">{t('report.no-reasons')}</p>
  );
};
