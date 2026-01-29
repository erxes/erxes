
import { useState, useEffect, useMemo } from 'react';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import { InfoCard, Table, ScrollArea, Select, Spinner, Button, Dialog, IconComponent } from 'erxes-ui';
import {
    endOfDay, startOfMonth, format
} from 'date-fns';
import { getDateRange } from '../utils/dateFilters';
import { ReportDateFilter } from './filter-popover/ReportDateFilter';
import {
    callReportsDashboard
} from '../../integrations/call/graphql/queries/callStatistics';
import { CALL_USER_INTEGRATIONS, CALL_QUEUE_LIST } from '../../integrations/call/graphql/queries/callConfigQueries';

const GET_DASHBOARD_STATS = gql(callReportsDashboard);

export const CallReportsView = () => {
    const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');
    const [selectedQueue, setSelectedQueue] = useState<string>('6518');
    const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MMM'));
    const [direction, setDirection] = useState<string>('all');

    // Calculate dates based on filter
    const { startDate, endDate, dateRangeLabel } = useMemo(() => {
        const { fromDate, toDate } = getDateRange(dateFilter);

        const start = fromDate || startOfMonth(new Date());
        const end = toDate || endOfDay(new Date());

        const startLabel = format(start, 'MMM dd, yyyy');
        const endLabel = format(end, 'MMM dd, yyyy');
        const label = startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            dateRangeLabel: label
        };
    }, [dateFilter]);

    // 1. Fetch Integrations
    const { data: integrationsData, loading: integrationsLoading } = useQuery(CALL_USER_INTEGRATIONS, {
        onCompleted: (data) => {
            const firstId = data?.callUserIntegrations?.[0]?._id;
            if (firstId && !selectedIntegrationId) setSelectedIntegrationId(firstId);
        }
    });

    // 2. Fetch Queues for selected integration
    const [getQueues, { data: queuesData, loading: queuesLoading }] = useLazyQuery(CALL_QUEUE_LIST);

    useEffect(() => {
        if (selectedIntegrationId) {
            getQueues({ variables: { integrationId: selectedIntegrationId } });
        }
    }, [selectedIntegrationId, getQueues]);

    useEffect(() => {
        if (queuesData?.callQueueList?.length > 0) {
            const firstQueue = queuesData.callQueueList[0];
            const queueValue = typeof firstQueue === 'string' ? firstQueue : firstQueue?.name || firstQueue?._id;
            if (!selectedQueue) {
                setSelectedQueue(queueValue);
            }
        }
    }, [queuesData, selectedQueue]);


    const hasQueue = !!selectedQueue;

    // 3. Fetch All Stats in One Query
    const { data, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS, {
        variables: {
            queue: selectedQueue,
            queueId: selectedQueue,
            startDate,
            endDate,
            direction: direction && direction !== 'all' ? direction : undefined
        },
        skip: !hasQueue
    });

    if (integrationsLoading || queuesLoading) {
        return <div className="flex justify-center p-8"><Spinner /></div>;
    }

    const integrations = integrationsData?.callUserIntegrations || [];
    const queues = queuesData?.callQueueList || [];

    const serviceLevel = data?.callCalculateServiceLevel;
    const fcr = data?.callCalculateFirstCallResolution;
    const abandonRate = data?.callCalculateAbandonmentRate;
    const asa = data?.callCalculateAverageSpeedOfAnswer;
    const aht = data?.callCalculateAverageHandlingTime;
    const occupancy = data?.callCalculateOccupancyRate;
    const queueStats = data?.callGetQueueStats || [];
    const agentStats = data?.callGetAgentStats || [];

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 p-4">
                {/* Filters */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg items-end flex-wrap">
                    <div className="w-64">
                        <label className="block text-sm font-medium mb-1">Integration</label>
                        <Select
                            value={selectedIntegrationId}
                            onValueChange={setSelectedIntegrationId}
                        >
                            <Select.Trigger>
                                <Select.Value placeholder="Select Integration" />
                            </Select.Trigger>
                            <Select.Content>
                                {integrations.map((int: any) => (
                                    <Select.Item key={int._id} value={int._id}>{int.phone || int.name || int._id}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select>
                    </div>
                    <div className="w-64">
                        <label className="block text-sm font-medium mb-1">Queue</label>
                        <Select
                            value={selectedQueue}
                            onValueChange={setSelectedQueue}
                        >
                            <Select.Trigger>
                                <Select.Value placeholder="Select Queue" />
                            </Select.Trigger>
                            <Select.Content>
                                {Array.isArray(queues) && queues.map((q: any) => {
                                    const val = typeof q === 'string' ? q : q.name || q._id;
                                    return <Select.Item key={val} value={val}>{val}</Select.Item>
                                })}
                            </Select.Content>
                        </Select>
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium mb-1">Direction</label>
                        <Select
                            value={direction}
                            onValueChange={setDirection}
                        >
                            <Select.Trigger>
                                <Select.Value placeholder="All Directions" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="all">All Directions</Select.Item>
                                <Select.Item value="Inbound">Inbound</Select.Item>
                                <Select.Item value="Outbound">Outbound</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                    <div className="w-auto">
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <Dialog>
                            <Dialog.Trigger asChild>
                                <Button variant="outline" className="w-64 justify-start text-left font-normal">
                                    <IconComponent icon="calendar-alt" className="mr-2 h-4 w-4" />
                                    {dateRangeLabel}
                                </Button>
                            </Dialog.Trigger>
                            <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
                        </Dialog>
                    </div>
                </div>

                {statsLoading && <div className="w-full flex justify-center"><Spinner /></div>}

                {!statsLoading && hasQueue && (
                    <>
                        {/* Key Metrics from Calculated Stats */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Key Performance Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <InfoCard title="Service Level">
                                    <div className="text-2xl font-bold">
                                        {serviceLevel?.toFixed(2) || '0.00'}%
                                    </div>
                                </InfoCard>
                                <InfoCard title="First Call Resolution">
                                    <div className="text-2xl font-bold">
                                        {fcr?.toFixed(2) || '0.00'}%
                                    </div>
                                </InfoCard>
                                <InfoCard title="Abandonment Rate">
                                    <div className="text-2xl font-bold">
                                        {abandonRate?.toFixed(2) || '0.00'}%
                                    </div>
                                </InfoCard>
                                <InfoCard title="Avg Speed of Answer">
                                    <div className="text-2xl font-bold">
                                        {asa?.toFixed(2) || '0.00'}s
                                    </div>
                                </InfoCard>
                                <InfoCard title="Avg Handling Time">
                                    <div className="text-2xl font-bold">
                                        {aht?.toFixed(2) || '0.00'}s
                                    </div>
                                </InfoCard>
                                <InfoCard title="Occupancy Rate">
                                    <div className="text-2xl font-bold">
                                        {occupancy?.toFixed(2) || '0.00'}%
                                    </div>
                                </InfoCard>

                            </div>
                        </div>

                        {/* Existing Stats */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Queue Statistics ({dateRangeLabel})</h3>
                            <div className="rounded-md border">
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head>Queue</Table.Head>
                                            <Table.Head>Total</Table.Head>
                                            <Table.Head>Answered</Table.Head>
                                            <Table.Head>Abandoned</Table.Head>
                                            <Table.Head>Avg Wait</Table.Head>
                                            <Table.Head>Avg Talk</Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {queueStats.length > 0 ? queueStats.map((stat: any, i: number) => (
                                            <Table.Row key={i}>
                                                <Table.Cell>{stat.queue}</Table.Cell>
                                                <Table.Cell>{stat.totalCalls}</Table.Cell>
                                                <Table.Cell>{stat.answeredCalls} ({stat.answeredRate}%)</Table.Cell>
                                                <Table.Cell>{stat.abandonedCalls} ({stat.abandonedRate}%)</Table.Cell>
                                                <Table.Cell>{stat.averageWaitTime.toFixed(1)}s</Table.Cell>
                                                <Table.Cell>{stat.averageTalkTime.toFixed(1)}s</Table.Cell>
                                            </Table.Row>
                                        )) : (
                                            <Table.Row>
                                                <Table.Cell colSpan={6} className="text-center">No data available</Table.Cell>
                                            </Table.Row>
                                        )}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Agent Statistics ({dateRangeLabel})</h3>
                            <div className="rounded-md border">
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head>Agent</Table.Head>
                                            <Table.Head>Total</Table.Head>
                                            <Table.Head>Answered</Table.Head>
                                            <Table.Head>Missed</Table.Head>
                                            <Table.Head>Avg Talk</Table.Head>
                                            <Table.Head>Avg Wait</Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {agentStats.length > 0 ? agentStats.map((stat: any, i: number) => (
                                            <Table.Row key={i}>
                                                <Table.Cell>{stat.agentName || stat.agent}</Table.Cell>
                                                <Table.Cell>{stat.totalCalls}</Table.Cell>
                                                <Table.Cell>{stat.answeredCalls} ({stat.answeredRate}%)</Table.Cell>
                                                <Table.Cell>{stat.missedCalls} ({stat.missedRate}%)</Table.Cell>
                                                <Table.Cell>{stat.averageTalkTime.toFixed(1)}s</Table.Cell>
                                                <Table.Cell>{stat.averageWaitTime.toFixed(1)}s</Table.Cell>
                                            </Table.Row>
                                        )) : (
                                            <Table.Row>
                                                <Table.Cell colSpan={6} className="text-center">No data available</Table.Cell>
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
