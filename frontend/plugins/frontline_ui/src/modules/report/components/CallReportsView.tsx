import { useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  IconComponent,
  ScrollArea,
  Select,
  Spinner,
  Table,
} from 'erxes-ui';
import { endOfDay, format, startOfMonth } from 'date-fns';
import {
  IconPhone,
  IconPhoneCheck,
  IconPhoneOff,
  IconPercentage,
  IconClock,
  IconMessage,
} from '@tabler/icons-react';
import { CALL_QUEUE_LIST } from '@/integrations/call/graphql/queries/callQueueList';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { callReportsDashboard } from '@/integrations/call/graphql/queries/callStatistics';
import { formatSeconds } from '@/integrations/call/utils/callUtils';
import { ReportDateFilter } from '@/report/components/filter-popover/ReportDateFilter';
import { getDateRange } from '@/report/utils/dateFilters';

const GET_DASHBOARD_STATS = gql(callReportsDashboard);

type QueueRecord = {
  _id?: string;
  name?: string;
};

type QueueOption = {
  label: string;
  value: string;
};

type QueueStat = {
  queue: string;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  abandonedCalls: number;
  abandonedRate: number;
  averageWaitTime: number;
  averageTalkTime: number;
};

type AgentStat = {
  agent: string;
  agentName?: string;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  missedCalls: number;
  missedRate: number;
  averageTalkTime: number;
  averageWaitTime: number;
};

type QueueListQuery = {
  callQueueList: Array<string | QueueRecord>;
};

type DashboardQuery = {
  callGetQueueStats: QueueStat[];
  callGetAgentStats: AgentStat[];
};

type DashboardQueryVariables = {
  startDate: string;
  endDate: string;
  queueId: string;
  direction?: string;
};

const directionOptions = [
  { label: 'All Directions', value: 'all' },
  { label: 'Inbound', value: 'Inbound' },
  { label: 'Outbound', value: 'Outbound' },
];

const emptyQueueStat: QueueStat = {
  queue: '',
  totalCalls: 0,
  answeredCalls: 0,
  answeredRate: 0,
  abandonedCalls: 0,
  abandonedRate: 0,
  averageWaitTime: 0,
  averageTalkTime: 0,
};

const normalizeQueue = (queue: string | QueueRecord): QueueOption | null => {
  if (typeof queue === 'string') {
    return {
      label: queue,
      value: queue,
    };
  }

  const value = queue.name || queue._id || queue.queue;

  if (!value) {
    return null;
  }

  return {
    label: queue.name || String(value),
    value: String(value),
  };
};

const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

const formatDuration = (value: number) => formatSeconds(Math.round(value));

const cardThemes: Record<
  string,
  { icon: React.ElementType; accent: string; iconBg: string }
> = {
  'Total Calls': {
    icon: IconPhone,
    accent: 'text-blue-600',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  'Answered Calls': {
    icon: IconPhoneCheck,
    accent: 'text-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  'Missed Calls': {
    icon: IconPhoneOff,
    accent: 'text-rose-600',
    iconBg: 'bg-rose-100 text-rose-600',
  },
  'Answer Rate': {
    icon: IconPercentage,
    accent: 'text-violet-600',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  'Avg Wait Time': {
    icon: IconClock,
    accent: 'text-amber-600',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  'Avg Talk Time': {
    icon: IconMessage,
    accent: 'text-cyan-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
};

const SummaryCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => {
  const theme = cardThemes[title] || {
    icon: IconPhone,
    accent: 'text-foreground',
    iconBg: 'bg-muted text-muted-foreground',
  };
  const Icon = theme.icon;

  return (
    <div className="group relative rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className={`text-3xl font-bold tracking-tight ${theme.accent}`}>
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${theme.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const formatPhoneStr = (phone: string) => {
  if (!phone) return '';
  if (phone.includes(',')) return phone.split(',').map((p) => p.trim()).join(', ');
  if (/^\d+$/.test(phone) && phone.length > 8 && phone.length % 8 === 0) {
    return phone.match(/.{1,8}/g)?.join(', ') || phone;
  }
  return phone;
};

export const CallReportsView = () => {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MMM'));
  const [direction, setDirection] = useState('all');
  const {
    callUserIntegrations: integrations = [],
    loading: integrationsLoading,
  } = useCallUserIntegration();

  const uniqueIntegrations = useMemo(() => {
    const map = new Map();
    for (const integration of integrations) {
      const formatted = formatPhoneStr(integration.phone);
      if (map.has(integration.inboxId)) {
        const existing = map.get(integration.inboxId);
        if (!existing.phone.includes(formatted)) {
          existing.phone += `, ${formatted}`;
        }
      } else {
        map.set(integration.inboxId, { ...integration, phone: formatted });
      }
    }
    return Array.from(map.values());
  }, [integrations]);

  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const { fromDate, toDate } = getDateRange(dateFilter);
    const start = fromDate || startOfMonth(new Date());
    const end = toDate || endOfDay(new Date());

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dateRangeLabel:
        format(start, 'MMM dd, yyyy') === format(end, 'MMM dd, yyyy')
          ? format(start, 'MMM dd, yyyy')
          : `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`,
    };
  }, [dateFilter]);

  useEffect(() => {
    if (selectedIntegrationId || !uniqueIntegrations.length) {
      return;
    }

    setSelectedIntegrationId(uniqueIntegrations[0].inboxId);
  }, [uniqueIntegrations, selectedIntegrationId]);

  const [loadQueues, { data: queuesData, loading: queuesLoading }] =
    useLazyQuery<QueueListQuery, { inboxId: string }>(CALL_QUEUE_LIST);

  useEffect(() => {
    if (!selectedIntegrationId) {
      return;
    }

    setSelectedQueue('');
    loadQueues({
      variables: {
        inboxId: selectedIntegrationId,
      },
    });
  }, [selectedIntegrationId, loadQueues]);

  const queueOptions = useMemo(() => {
    return (queuesData?.callQueueList || [])
      .map(normalizeQueue)
      .filter((queue): queue is QueueOption => Boolean(queue));
  }, [queuesData]);

  useEffect(() => {
    if (!queueOptions.length) {
      return;
    }

    const hasSelectedQueue = queueOptions.some(
      ({ value }) => value === selectedQueue,
    );

    if (!hasSelectedQueue) {
      setSelectedQueue(queueOptions[0].value);
    }
  }, [queueOptions, selectedQueue]);

  const hasQueue = Boolean(selectedQueue);

  const selectedQueueLabel = useMemo(() => {
    const match = queueOptions.find(({ value }) => value === selectedQueue);
    return match?.label || selectedQueue;
  }, [queueOptions, selectedQueue]);

  const { data, loading: statsLoading } = useQuery<
    DashboardQuery,
    DashboardQueryVariables
  >(GET_DASHBOARD_STATS, {
    variables: {
      startDate,
      endDate,
      queueId: selectedQueue,
      direction: direction === 'all' ? undefined : direction,
    },
    skip: !hasQueue,
  });

  const queueStats = data?.callGetQueueStats || [];
  const agentStats = data?.callGetAgentStats || [];
  const selectedQueueStats = queueStats[0] || {
    ...emptyQueueStat,
    queue: selectedQueue,
  };

  const summaryCards = [
    {
      title: 'Total Calls',
      value: selectedQueueStats.totalCalls.toLocaleString(),
      description: `Queue ${selectedQueueLabel || '–'} · ${dateRangeLabel}`,
    },
    {
      title: 'Answered Calls',
      value: selectedQueueStats.answeredCalls.toLocaleString(),
      description: `${formatPercentage(
        selectedQueueStats.answeredRate,
      )} of total`,
    },
    {
      title: 'Missed Calls',
      value: selectedQueueStats.abandonedCalls.toLocaleString(),
      description: `${formatPercentage(
        selectedQueueStats.abandonedRate,
      )} of total`,
    },
    {
      title: 'Answer Rate',
      value: formatPercentage(selectedQueueStats.answeredRate),
      description:
        direction === 'all'
          ? 'Across all directions'
          : `${direction} calls only`,
    },
    {
      title: 'Avg Wait Time',
      value: formatDuration(selectedQueueStats.averageWaitTime),
      description: 'Average time before answer',
    },
    {
      title: 'Avg Talk Time',
      value: formatDuration(selectedQueueStats.averageTalkTime),
      description: 'Average answered talk duration',
    },
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-8 pb-8">
        <div className="flex flex-wrap items-end gap-5 rounded-xl border bg-background p-5 shadow-sm">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Integration
            </label>
            <Select
              value={selectedIntegrationId}
              onValueChange={setSelectedIntegrationId}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select integration" />
              </Select.Trigger>
              <Select.Content>
                {uniqueIntegrations.map((integration) => (
                  <Select.Item key={integration.inboxId} value={integration.inboxId}>
                    {integration.phone}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Queue
            </label>
            <Select value={selectedQueue} onValueChange={setSelectedQueue}>
              <Select.Trigger disabled={!queueOptions.length}>
                <Select.Value placeholder="Select queue" />
              </Select.Trigger>
              <Select.Content>
                {queueOptions.map((queue) => (
                  <Select.Item key={queue.value} value={queue.value}>
                    {queue.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Direction
            </label>
            <Select value={direction} onValueChange={setDirection}>
              <Select.Trigger>
                <Select.Value placeholder="All directions" />
              </Select.Trigger>
              <Select.Content>
                {directionOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </label>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <IconComponent name="calendar-alt" className="mr-2 h-4 w-4" />
                  {dateRangeLabel}
                </Button>
              </Dialog.Trigger>
              <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
            </Dialog>
          </div>
        </div>

        {(integrationsLoading || queuesLoading) && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!integrationsLoading && uniqueIntegrations.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No call integration was found for this user.
          </div>
        )}

        {!queuesLoading &&
          selectedIntegrationId &&
          uniqueIntegrations.length > 0 &&
          queueOptions.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              The selected integration has no assigned queues.
            </div>
          )}

        {statsLoading && hasQueue && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!statsLoading && hasQueue && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
              ))}
            </div>

            {queueStats.length === 0 && (
              <div className="rounded-xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
                No call records were found for this queue in the selected date
                range.
              </div>
            )}

            {queueStats.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-blue-500" />
                    <h3 className="text-base font-semibold">Queue Snapshot</h3>
                  </div>
                  <div className="overflow-hidden rounded-xl border shadow-sm">
                    <Table>
                      <Table.Header>
                        <Table.Row className="bg-muted/50">
                          <Table.Head className="font-semibold">Queue</Table.Head>
                          <Table.Head className="font-semibold text-right">Total</Table.Head>
                          <Table.Head className="font-semibold text-right">Answered</Table.Head>
                          <Table.Head className="font-semibold text-right">Missed</Table.Head>
                          <Table.Head className="font-semibold text-right">Answer Rate</Table.Head>
                          <Table.Head className="font-semibold text-right">Avg Wait</Table.Head>
                          <Table.Head className="font-semibold text-right">Avg Talk</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        <Table.Row className="hover:bg-muted/30">
                          <Table.Cell className="font-medium">
                            {selectedQueueLabel || selectedQueueStats.queue}
                          </Table.Cell>
                          <Table.Cell className="text-right font-semibold">
                            {selectedQueueStats.totalCalls}
                          </Table.Cell>
                          <Table.Cell className="text-right">
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                              {selectedQueueStats.answeredCalls}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="text-right">
                            <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                              {selectedQueueStats.abandonedCalls}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="text-right font-medium">
                            {formatPercentage(selectedQueueStats.answeredRate)}
                          </Table.Cell>
                          <Table.Cell className="text-right font-mono text-sm">
                            {formatDuration(selectedQueueStats.averageWaitTime)}
                          </Table.Cell>
                          <Table.Cell className="text-right font-mono text-sm">
                            {formatDuration(selectedQueueStats.averageTalkTime)}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-violet-500" />
                    <h3 className="text-base font-semibold">Agent Breakdown</h3>
                  </div>
                  <div className="overflow-hidden rounded-xl border shadow-sm">
                    <Table>
                      <Table.Header>
                        <Table.Row className="bg-muted/50">
                          <Table.Head className="font-semibold">Agent</Table.Head>
                          <Table.Head className="font-semibold text-right">Total</Table.Head>
                          <Table.Head className="font-semibold text-right">Answered</Table.Head>
                          <Table.Head className="font-semibold text-right">Missed</Table.Head>
                          <Table.Head className="font-semibold text-right">Answer Rate</Table.Head>
                          <Table.Head className="font-semibold text-right">Avg Wait</Table.Head>
                          <Table.Head className="font-semibold text-right">Avg Talk</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {agentStats.length > 0 ? (
                          agentStats.map((stat, index) => (
                            <Table.Row
                              key={`${stat.agent}-${stat.agentName || ''}`}
                              className={`hover:bg-muted/30 ${
                                index % 2 === 0 ? '' : 'bg-muted/20'
                              }`}
                            >
                              <Table.Cell className="font-medium">
                                {stat.agentName || stat.agent}
                              </Table.Cell>
                              <Table.Cell className="text-right font-semibold">
                                {stat.totalCalls}
                              </Table.Cell>
                              <Table.Cell className="text-right">
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                                  {stat.answeredCalls}
                                </span>
                              </Table.Cell>
                              <Table.Cell className="text-right">
                                <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                                  {stat.missedCalls}
                                </span>
                              </Table.Cell>
                              <Table.Cell className="text-right font-medium">
                                {formatPercentage(stat.answeredRate)}
                              </Table.Cell>
                              <Table.Cell className="text-right font-mono text-sm">
                                {formatDuration(stat.averageWaitTime)}
                              </Table.Cell>
                              <Table.Cell className="text-right font-mono text-sm">
                                {formatDuration(stat.averageTalkTime)}
                              </Table.Cell>
                            </Table.Row>
                          ))
                        ) : (
                          <Table.Row>
                            <Table.Cell
                              colSpan={7}
                              className="py-8 text-center text-muted-foreground"
                            >
                              No agent level statistics available
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
};
