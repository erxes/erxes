import type { LeadReport } from '@erxes/core-contract';
import { IconChartFunnel } from '@tabler/icons-react';
import { cn, PageContainer, ScrollArea, Select, Skeleton } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { messageOf } from '~/lib/api';
import { ContactsPageHeader } from '~/modules/contacts/components/ContactsPageHeader';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { MembersInline } from '~/modules/contacts/components/SelectMember';
import { useLeadReport } from './useLeads';

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const percent = (value: number) => `${Math.round(value * 1000) / 10}%`;

/** A headline number. */
const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col gap-1 rounded-lg border bg-background p-4">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-2xl font-semibold tabular-nums">{value}</span>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </div>
);

/** A thin bar from the baseline, rounded at its data end; the number sits beside it in text ink. */
const Bar = ({ value, max, title }: { value: number; max: number; title: string }) => (
  <div className="flex h-5 flex-1 items-center gap-2" title={title}>
    <div className="h-2.5 flex-1">
      <div className="h-full rounded-r bg-primary" style={{ width: `${max ? Math.max((value / max) * 100, value ? 1 : 0) : 0}%` }} />
    </div>
    <span className="w-14 shrink-0 text-right text-sm tabular-nums">{value.toLocaleString('en')}</span>
  </div>
);

const Section = ({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) => (
  <section className={cn('flex flex-col gap-3 rounded-lg border bg-background p-4', className)}>
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

const Funnel = ({ report }: { report: LeadReport }) => {
  const max = Math.max(...report.stages.map((stage) => Math.max(stage.current, stage.reached)), 1);

  return (
    <Section title="Stages" description="Leads in each stage now, how many reached it in the period, and how long they stayed.">
      <div className="grid grid-cols-[minmax(120px,1fr)_2fr_2fr_80px] items-center gap-x-4 gap-y-2 text-sm">
        <span />
        <span className="text-xs text-muted-foreground">In it now</span>
        <span className="text-xs text-muted-foreground">Reached in period</span>
        <span className="text-right text-xs text-muted-foreground">Avg. stay</span>
        {report.stages.map((stage) => (
          <div key={stage.stageId} className="contents">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: stage.color }} />
              <span className="truncate">{stage.name}</span>
            </span>
            <Bar value={stage.current} max={max} title={`${stage.name}: ${stage.current} leads now`} />
            <Bar value={stage.reached} max={max} title={`${stage.name}: ${stage.reached} reached it in the period`} />
            <span className="text-right tabular-nums text-muted-foreground">{stage.averageDays === null ? '–' : `${stage.averageDays} d`}</span>
          </div>
        ))}
      </div>
    </Section>
  );
};

/** Rows "name · leads · became customers · rate", for sources and owners. */
const CohortTable = ({ rows, label }: { rows: { key: React.ReactNode; id: string; count: number; converted: number }[]; label: string }) => {
  const max = Math.max(...rows.map((row) => row.count), 1);

  return rows.length ? (
    <div className="grid grid-cols-[minmax(100px,1fr)_2fr_70px_60px] items-center gap-x-3 gap-y-2 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">New leads</span>
      <span className="text-right text-xs text-muted-foreground">Customers</span>
      <span className="text-right text-xs text-muted-foreground">Rate</span>
      {rows.map((row) => (
        <div key={row.id} className="contents">
          <span className="min-w-0 truncate capitalize">{row.key}</span>
          <Bar value={row.count} max={max} title={`${row.count} new leads, ${row.converted} became customers`} />
          <span className="text-right tabular-nums">{row.converted.toLocaleString('en')}</span>
          <span className="text-right tabular-nums text-muted-foreground">{percent(row.count ? row.converted / row.count : 0)}</span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">No new leads in this period.</p>
  );
};

/**
 * Contacts › Leads › Insights: how many leads came, how many became
 * customers, how long it took, where the good ones come from, who converts
 * them, and why the others were lost.
 */
export const LeadInsightsPage = () => {
  const [days, setDays] = useState('30');
  const range = useMemo(() => {
    const to = new Date();

    return { from: new Date(to.getTime() - Number(days) * 86_400_000).toISOString(), to: to.toISOString() };
  }, [days]);
  const { data: report, error, isPending } = useLeadReport(range);

  return (
    <PageContainer>
      <ContactsPageHeader>
        <ContactsPageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: 'Leads', to: '/contacts/leads', icon: IconChartFunnel },
              { label: 'Insights', to: '/contacts/leads/insights' },
            ]}
          />
        </ContactsPageHeader.Start>
        <ContactsPageHeader.End>
          <Select value={days} onValueChange={setDays}>
            <Select.Trigger className="h-8 w-40">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {RANGES.map((range) => (
                <Select.Item key={range.value} value={range.value}>
                  {range.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </ContactsPageHeader.End>
      </ContactsPageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
          {error && <p className="text-sm text-destructive">{messageOf(error)}</p>}
          {isPending || !report ? (
            <Skeleton className="h-96" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="New leads" value={report.created.toLocaleString('en')} />
                <Stat label="Became customers" value={report.converted.toLocaleString('en')} hint={`${report.disqualified.toLocaleString('en')} disqualified`} />
                <Stat label="Conversion rate" value={percent(report.conversionRate)} hint="Of this period’s new leads" />
                <Stat
                  label="Time to convert"
                  value={report.daysToConvert.median === null ? '–' : `${report.daysToConvert.median} d`}
                  hint={report.daysToConvert.average === null ? undefined : `Median; average ${report.daysToConvert.average} d`}
                />
              </div>
              <Funnel report={report} />
              <div className="grid gap-4 md:grid-cols-2">
                <Section title="Sources" description="This period’s new leads by where they came from.">
                  <CohortTable label="Source" rows={report.bySource.map((row) => ({ id: row.source ?? 'none', key: row.source ?? 'Unknown', count: row.count, converted: row.converted }))} />
                </Section>
                <Section title="Owners" description="This period’s new leads by owner.">
                  <CohortTable
                    label="Owner"
                    rows={report.byOwner.map((row) => ({
                      id: row.ownerId ?? 'none',
                      key: row.ownerId ? <MembersInline memberIds={[row.ownerId]} /> : 'No owner',
                      count: row.count,
                      converted: row.converted,
                    }))}
                  />
                </Section>
              </div>
              <Section title="Why leads were lost" description="Reasons given when disqualifying, most common first.">
                {report.reasons.length ? (
                  <div className="flex flex-col gap-2">
                    {report.reasons.map((row) => (
                      <div key={row.reason} className="flex items-center gap-3 text-sm">
                        <span className="w-48 shrink-0 truncate">{row.reason}</span>
                        <Bar value={row.count} max={report.reasons[0]!.count} title={`${row.reason}: ${row.count}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No leads were disqualified with a reason in this period.</p>
                )}
              </Section>
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
