import { useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  IconComponent,
  InfoCard,
  ScrollArea,
  Select,
  Spinner,
  Table,
} from 'erxes-ui';
import { endOfDay, format, startOfMonth } from 'date-fns';
import { CALL_USER_INTEGRATIONS } from '@/integrations/call/graphql/queries/callConfigQueries';
import { CALL_QUEUE_LIST } from '@/integrations/call/graphql/queries/callQueueList';
import { callReportsDashboard } from '@/integrations/call/graphql/queries/callStatistics';
import { formatSeconds } from '@/integrations/call/utils/callUtils';
import { ReportDateFilter } from '@/report/components/filter-popover/ReportDateFilter';
import { getDateRange } from '@/report/utils/dateFilters';

const GET_DASHBOARD_STATS = gql(callReportsDashboard);

type CallIntegration = {
  _id: string;
  name?: string;
  phone?: string;
};

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

  const value = queue.name || queue._id;

  if (!value) {
    return null;
  }

  return {
    label: queue.name || value,
    value,
  };
};

const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

const formatDuration = (value: number) => formatSeconds(Math.round(value));

const SummaryCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => {
  return (
    <InfoCard title={title}>
      <div className="space-y-1">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </InfoCard>
  );
};

export const CallReportsView = () => {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MMM'));
  const [direction, setDirection] = useState('all');

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

  const { data: integrationsData, loading: integrationsLoading } = useQuery<{
    callUserIntegrations: CallIntegration[];
  }>(CALL_USER_INTEGRATIONS, {
    onCompleted: ({ callUserIntegrations }) => {
      const firstIntegrationId = callUserIntegrations?.[0]?._id;

      if (firstIntegrationId && !selectedIntegrationId) {
        setSelectedIntegrationId(firstIntegrationId);
      }
    },
  });

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

  const integrations = integrationsData?.callUserIntegrations || [];
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
      description: `${selectedQueue || 'Selected queue'} · ${dateRangeLabel}`,
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
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-background p-4">
          <div className="w-64">
            <label className="mb-1 block text-sm font-medium">
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
                {integrations.map((integration) => (
                  <Select.Item key={integration._id} value={integration._id}>
                    {integration.phone || integration.name || integration._id}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="w-64">
            <label className="mb-1 block text-sm font-medium">Queue</label>
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
          <div className="w-48">
            <label className="mb-1 block text-sm font-medium">Direction</label>
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
          <div className="w-64">
            <label className="mb-1 block text-sm font-medium">Date</label>
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

        {!integrationsLoading && integrations.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No call integration was found for this user.
          </div>
        )}

        {!queuesLoading &&
          selectedIntegrationId &&
          integrations.length > 0 &&
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
              ))}
            </div>

            {queueStats.length === 0 && (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No call records were found for this queue in the selected date
                range.
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Queue Snapshot</h3>
              <div className="rounded-md border">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Queue</Table.Head>
                      <Table.Head>Total</Table.Head>
                      <Table.Head>Answered</Table.Head>
                      <Table.Head>Missed</Table.Head>
                      <Table.Head>Answer Rate</Table.Head>
                      <Table.Head>Avg Wait</Table.Head>
                      <Table.Head>Avg Talk</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                        {selectedQueueStats.queue || selectedQueue}
                      </Table.Cell>
                      <Table.Cell>{selectedQueueStats.totalCalls}</Table.Cell>
                      <Table.Cell>
                        {selectedQueueStats.answeredCalls}
                      </Table.Cell>
                      <Table.Cell>
                        {selectedQueueStats.abandonedCalls}
                      </Table.Cell>
                      <Table.Cell>
                        {formatPercentage(selectedQueueStats.answeredRate)}
                      </Table.Cell>
                      <Table.Cell>
                        {formatDuration(selectedQueueStats.averageWaitTime)}
                      </Table.Cell>
                      <Table.Cell>
                        {formatDuration(selectedQueueStats.averageTalkTime)}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Agent Breakdown</h3>
              <div className="rounded-md border">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Agent</Table.Head>
                      <Table.Head>Total</Table.Head>
                      <Table.Head>Answered</Table.Head>
                      <Table.Head>Missed</Table.Head>
                      <Table.Head>Answer Rate</Table.Head>
                      <Table.Head>Avg Wait</Table.Head>
                      <Table.Head>Avg Talk</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {agentStats.length > 0 ? (
                      agentStats.map((stat) => (
                        <Table.Row
                          key={`${stat.agent}-${stat.agentName || ''}`}
                        >
                          <Table.Cell>
                            {stat.agentName || stat.agent}
                          </Table.Cell>
                          <Table.Cell>{stat.totalCalls}</Table.Cell>
                          <Table.Cell>{stat.answeredCalls}</Table.Cell>
                          <Table.Cell>{stat.missedCalls}</Table.Cell>
                          <Table.Cell>
                            {formatPercentage(stat.answeredRate)}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDuration(stat.averageWaitTime)}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDuration(stat.averageTalkTime)}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={7} className="text-center">
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
      </div>
    </ScrollArea>
  );
};
