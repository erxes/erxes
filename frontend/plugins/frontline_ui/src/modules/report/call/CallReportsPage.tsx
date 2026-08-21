import { useEffect, useMemo, useState } from 'react';
import { format, endOfDay, startOfMonth, subMonths } from 'date-fns';
import { ScrollArea, Spinner, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useCallReportIntegrations } from './hooks/useCallReportIntegrations';
import { CUSTOM_TIME_PREFIX, getDateRange } from '@/report/utils/dateFilters';

import { CallFiltersContext } from './hooks/useCallFilters';
import { SubHeader } from './components/SubHeader';
import { KpiSection } from './components/KpiSection/KpiSection';
import { OverviewSection } from './components/OverviewSection/OverviewSection';
import { QueuesSection } from './components/QueuesSection/QueuesSection';
import { AgentsSection } from './components/AgentsSection/AgentsSection';
import { CallbacksSection } from './components/CallbacksSection/CallbacksSection';
import { TopNumbersSection } from './components/TopNumbersSection/TopNumbersSection';
import { CallHistorySection } from './components/CallHistorySection/CallHistorySection';

import { deduplicateIntegrations, normalizeQueue } from './utils';
import type { CallFilters, SelectOption } from './types';

const TABS = [
  { value: 'overview', label: 'overview' },
  { value: 'queues', label: 'queues' },
  { value: 'agents', label: 'agents' },
  { value: 'callbacks', label: 'callbacks' },
  { value: 'top-numbers', label: 'top-numbers' },
  { value: 'call-history', label: 'call-history' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

const ALL_QUEUES = 'all';

export function CallReportsPage() {
  const { t } = useTranslation('frontline');
  const [tab, setTab] = useState<TabValue>('overview');
  const [integrationId, setIntegrationId] = useState('');
  const [queueId, setQueueId] = useState(ALL_QUEUES);
  const [direction, setDirection] = useState('all');
  const [dateFilter, setDateFilter] = useState('last-3-months');

  const { integrations, loading: integrationsLoading } =
    useCallReportIntegrations();

  const integrationOptions = useMemo<SelectOption[]>(() => {
    const deduped = deduplicateIntegrations(integrations as any);
    return deduped.map((i) => ({ label: i.phone, value: i.inboxId }));
  }, [integrations]);

  useEffect(() => {
    if (integrationId || !integrationOptions.length) return;
    setIntegrationId(integrationOptions[0].value);
  }, [integrationOptions, integrationId]);

  const queueOptions = useMemo<SelectOption[]>(
    () => [
      { label: 'All Queues', value: ALL_QUEUES },
      ...(integrations.find((i) => i.inboxId === integrationId)?.queues ?? [])
        .map(normalizeQueue)
        .filter((q): q is SelectOption => Boolean(q)),
    ],
    [integrations, integrationId],
  );

  const queuesLoading = integrationsLoading;

  useEffect(() => {
    if (!queueOptions.some(({ value }) => value === queueId)) {
      setQueueId(ALL_QUEUES);
    }
  }, [queueOptions, queueId]);

  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const { fromDate, toDate } = getDateRange(dateFilter);
    const start = fromDate ?? startOfMonth(subMonths(new Date(), 3));
    const end = toDate ?? endOfDay(new Date());
    const sameDay =
      format(start, 'MMM dd, yyyy') === format(end, 'MMM dd, yyyy');
    const withTime = dateFilter.startsWith(CUSTOM_TIME_PREFIX);

    const label = withTime
      ? sameDay
        ? `${format(start, 'MMM dd, yyyy')} · ${format(
            start,
            'HH:mm',
          )} — ${format(end, 'HH:mm')}`
        : `${format(start, 'MMM dd, yyyy HH:mm')} — ${format(
            end,
            'MMM dd, yyyy HH:mm',
          )}`
      : sameDay
      ? format(start, 'MMM dd, yyyy')
      : `${format(start, 'MMM dd, yyyy')} — ${format(end, 'MMM dd, yyyy')}`;

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dateRangeLabel: label,
    };
  }, [dateFilter]);

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
        <SubHeader
          integrationOptions={integrationOptions}
          queueOptions={queueOptions}
          integrationsLoading={integrationsLoading}
          queuesLoading={queuesLoading}
        />

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

        {hasIntegration && (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabValue)}
            className="flex flex-col flex-1 overflow-hidden"
          >
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

            <div className="px-6 pt-5 shrink-0">
              <KpiSection />
            </div>

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

                <Tabs.Content
                  value="call-history"
                  className="mt-0 outline-none"
                >
                  <CallHistorySection />
                </Tabs.Content>
              </div>
            </ScrollArea>
          </Tabs>
        )}
      </div>
    </CallFiltersContext.Provider>
  );
}
