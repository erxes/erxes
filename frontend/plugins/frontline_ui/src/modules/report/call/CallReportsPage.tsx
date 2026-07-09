import { useEffect, useMemo, useState } from 'react';
import { format, endOfDay, startOfMonth, subMonths } from 'date-fns';
import { ScrollArea, Spinner, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { getDateRange } from '@/report/utils/dateFilters';

import { CallFiltersContext } from './hooks/useCallFilters';
import { useReportIntegrations } from './hooks/useReportIntegrations';
import { SubHeader } from './components/SubHeader';
import { KpiSection } from './components/KpiSection/KpiSection';
import { OverviewSection } from './components/OverviewSection/OverviewSection';
import { QueuesSection } from './components/QueuesSection/QueuesSection';
import { AgentsSection } from './components/AgentsSection/AgentsSection';
import { CallbacksSection } from './components/CallbacksSection/CallbacksSection';
import { TopNumbersSection } from './components/TopNumbersSection/TopNumbersSection';

import { deduplicateIntegrations } from './utils';
import type { CallFilters, SelectOption } from './types';

const ALL_QUEUES_OPTION: SelectOption = { label: 'All queues', value: 'all' };

const TABS = [
  { value: 'overview', label: 'overview' },
  { value: 'queues', label: 'queues' },
  { value: 'agents', label: 'agents' },
  { value: 'callbacks', label: 'callbacks' },
  { value: 'top-numbers', label: 'top-numbers' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

/**
 * Main Call Reports page.
 *
 * - Owns all filter state (integration, queue, direction, date range)
 * - Provides it via `CallFiltersContext` so child sections can call their own queries
 * - Has a `SubHeader` filter bar and `Tabs` navigation to 5 section views
 */
export function CallReportsPage() {
  const { t } = useTranslation('frontline');
  const [tab, setTab] = useState<TabValue>('overview');
  const [integrationId, setIntegrationId] = useState('');
  const [queueId, setQueueId] = useState('all');
  const [direction, setDirection] = useState('all');
  const [dateFilter, setDateFilter] = useState('last-3-months');

  // ── Integrations ─────────────────────────────────────────────────────────
  // All call integrations — not limited to ones the current user operates.
  const { integrations, loading: integrationsLoading } =
    useReportIntegrations();

  const integrationOptions = useMemo<SelectOption[]>(() => {
    const deduped = deduplicateIntegrations(integrations);
    return deduped.map((i) => ({ label: i.phone, value: i.inboxId }));
  }, [integrations]);

  // Auto-select first integration
  useEffect(() => {
    if (integrationId || !integrationOptions.length) return;
    setIntegrationId(integrationOptions[0].value);
  }, [integrationOptions, integrationId]);

  // ── Queues ───────────────────────────────────────────────────────────────
  // Queue options come from the selected integration's own queue list
  // (union across duplicate docs sharing the same inboxId), plus "All queues".
  // `queueNames` is index-parallel to `queues`, so use it for friendly labels.
  const queueOptions = useMemo<SelectOption[]>(() => {
    const labels = new Map<string, string>();
    for (const integration of integrations) {
      if (integration.inboxId !== integrationId) continue;
      (integration.queues ?? []).forEach((queue, index) => {
        if (!queue) return;
        const value = String(queue);
        const name = integration.queueNames?.[index];
        if (name && name !== value) {
          labels.set(value, `${name} (${value})`);
        } else if (!labels.has(value)) {
          labels.set(value, value);
        }
      });
    }
    return [
      ALL_QUEUES_OPTION,
      ...Array.from(labels, ([value, label]) => ({ label, value })),
    ];
  }, [integrations, integrationId]);

  // Reset to "All queues" when the selected queue disappears
  // (e.g. after switching integration)
  useEffect(() => {
    if (!queueOptions.some(({ value }) => value === queueId)) {
      setQueueId(ALL_QUEUES_OPTION.value);
    }
  }, [queueOptions, queueId]);

  // ── Derived date values ───────────────────────────────────────────────────
  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const { fromDate, toDate } = getDateRange(dateFilter);
    const start = fromDate ?? startOfMonth(subMonths(new Date(), 3));
    const end = toDate ?? endOfDay(new Date());
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dateRangeLabel:
        format(start, 'MMM dd, yyyy') === format(end, 'MMM dd, yyyy')
          ? format(start, 'MMM dd, yyyy')
          : `${format(start, 'MMM dd, yyyy')} — ${format(end, 'MMM dd, yyyy')}`,
    };
  }, [dateFilter]);

  // ── Context value ─────────────────────────────────────────────────────────
  const filtersCtx = useMemo<CallFilters>(
    () => ({
      integrationId,
      setIntegrationId,
      queueId,
      setQueueId,
      direction,
      setDirection,
      dateFilter,
      setDateFilter,
      startDate,
      endDate,
      dateRangeLabel,
    }),
    [
      integrationId,
      queueId,
      direction,
      dateFilter,
      startDate,
      endDate,
      dateRangeLabel,
    ],
  );

  const hasIntegration = Boolean(integrationId);

  return (
    <CallFiltersContext.Provider value={filtersCtx}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Page sub-header: filter controls ─────────────────────────── */}
        <SubHeader
          integrationOptions={integrationOptions}
          queueOptions={queueOptions}
          integrationsLoading={integrationsLoading}
        />

        {/* ── Empty / error states ──────────────────────────────────────── */}
        {!integrationsLoading && !integrationOptions.length && (
          <div className="m-6 rounded-xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
            {t('no-call-integration-found')}
          </div>
        )}

        {integrationsLoading && !hasIntegration && (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────── */}
        {hasIntegration && (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabValue)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Tab strip */}
            <div className="border-b bg-sidebar px-6 shrink-0">
              <Tabs.List className="h-10 gap-0 rounded-none bg-transparent p-0">
                {TABS.map(({ value, label }) => (
                  <Tabs.Trigger
                    key={value}
                    value={value}
                    className="h-10 rounded-none border-b-2 border-transparent px-4 text-xs font-medium data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(label)}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </div>

            {/* KPI scorecard — always visible across all tabs */}
            <div className="px-6 pt-5 shrink-0">
              <KpiSection />
            </div>

            {/* Scrollable tab content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="mx-auto w-full max-w-[1440px] px-6 pb-10 pt-5">
                <Tabs.Content value="overview" className="mt-0 outline-none">
                  <OverviewSection />
                </Tabs.Content>

                <Tabs.Content value="queues" className="mt-0 outline-none">
                  <QueuesSection queueOptions={queueOptions} />
                </Tabs.Content>

                <Tabs.Content value="agents" className="mt-0 outline-none">
                  <AgentsSection />
                </Tabs.Content>

                <Tabs.Content value="callbacks" className="mt-0 outline-none">
                  <CallbacksSection />
                </Tabs.Content>

                <Tabs.Content value="top-numbers" className="mt-0 outline-none">
                  <TopNumbersSection />
                </Tabs.Content>
              </div>
            </ScrollArea>
          </Tabs>
        )}
      </div>
    </CallFiltersContext.Provider>
  );
}
