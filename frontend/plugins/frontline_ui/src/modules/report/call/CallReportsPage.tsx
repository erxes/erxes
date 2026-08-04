import { useEffect, useMemo, useState } from 'react';
import { format, endOfDay, startOfMonth, subMonths } from 'date-fns';
import { ScrollArea, Spinner, Tabs } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { CALL_QUEUE_LIST } from '@/integrations/call/graphql/queries/callQueueList';
import { getDateRange } from '@/report/utils/dateFilters';

import { CallFiltersContext } from './hooks/useCallFilters';
import { SubHeader } from './components/SubHeader';
import { KpiSection } from './components/KpiSection/KpiSection';
import { OverviewSection } from './components/OverviewSection/OverviewSection';
import { QueuesSection } from './components/QueuesSection/QueuesSection';
import { AgentsSection } from './components/AgentsSection/AgentsSection';
import { CallbacksSection } from './components/CallbacksSection/CallbacksSection';
import { TopNumbersSection } from './components/TopNumbersSection/TopNumbersSection';

import { deduplicateIntegrations, normalizeQueue } from './utils';
import type { CallFilters, SelectOption } from './types';

type QueueRecord = { _id?: string; name?: string; queue?: string };

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
  const [queueId, setQueueId] = useState('');
  const [direction, setDirection] = useState('all');
  const [dateFilter, setDateFilter] = useState('last-3-months');

  // ── Integrations ─────────────────────────────────────────────────────────
  const { callUserIntegrations = [], loading: integrationsLoading } =
    useCallUserIntegration();

  const integrationOptions = useMemo<SelectOption[]>(() => {
    const deduped = deduplicateIntegrations(callUserIntegrations as any);
    return deduped.map((i) => ({ label: i.phone, value: i.inboxId }));
  }, [callUserIntegrations]);

  // Auto-select first integration
  useEffect(() => {
    if (integrationId || !integrationOptions.length) return;
    setIntegrationId(integrationOptions[0].value);
  }, [integrationOptions, integrationId]);

  // ── Queues ───────────────────────────────────────────────────────────────
  const { data: queuesData, loading: queuesLoading } = useQuery<
    { callQueueList: Array<string | QueueRecord> },
    { inboxId: string }
  >(CALL_QUEUE_LIST, {
    variables: { inboxId: integrationId },
    skip: !integrationId,
  });

  const queueOptions = useMemo<SelectOption[]>(
    () =>
      (queuesData?.callQueueList ?? [])
        .map(normalizeQueue)
        .filter((q): q is SelectOption => Boolean(q)),
    [queuesData],
  );

  // Auto-select first queue (or reset when integration changes)
  useEffect(() => {
    if (!queueOptions.length) return;
    if (!queueOptions.some(({ value }) => value === queueId)) {
      setQueueId(queueOptions[0].value);
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

  const hasQueue = Boolean(queueId);

  return (
    <CallFiltersContext.Provider value={filtersCtx}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Page sub-header: filter controls ─────────────────────────── */}
        <SubHeader
          integrationOptions={integrationOptions}
          queueOptions={queueOptions}
          integrationsLoading={integrationsLoading}
          queuesLoading={queuesLoading}
        />

        {/* ── Empty / error states ──────────────────────────────────────── */}
        {!integrationsLoading && !integrationOptions.length && (
          <div className="m-6 rounded-xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
            {t('no-call-integration-found')}
          </div>
        )}
        {!queuesLoading &&
          integrationId &&
          integrationOptions.length > 0 &&
          !queueOptions.length && (
            <div className="m-6 rounded-xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
              {t('no-queues-assigned')}
            </div>
          )}

        {(integrationsLoading || queuesLoading) && !hasQueue && (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────── */}
        {hasQueue && (
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
