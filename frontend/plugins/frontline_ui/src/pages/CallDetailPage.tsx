import {
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconInfoCircle,
  IconPhone,
  IconSearch,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/table-core';
import {
  Breadcrumb,
  Button,
  Collapsible,
  Badge,
  DropdownMenu,
  Filter,
  PageContainer,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Separator,
  Input,
  Skeleton,
  Spinner,
  formatPhoneNumber,
  isUndefinedOrNull,
  useFilterQueryState,
} from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { differenceInSeconds } from 'date-fns';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import {
  ICallAgentDailyStat,
  ICallQueueRealtimeSnapshot,
} from '@/integrations/call/types/callTypes';
import { useEffect, useMemo, useState } from 'react';
import {
  formatDurationShort,
  formatSeconds,
  safeFormatDate,
} from '@/integrations/call/utils/callUtils';
import { QUEUE_REALTIME_UPDATE } from '@/integrations/call/graphql/subscriptions/subscriptions';
import { useSubscription } from '@apollo/client';
import { useCallDurationFromDate } from '@/integrations/call/hooks/useCallDuration';
import { useCallQueueInitialList } from '@/integrations/call/hooks/useCallQueueInitialList';
import { useCallAgentDailyStats } from '@/integrations/call/hooks/useCallAgentDailyStats';
import { getDateRange } from '@/report/utils/dateFilters';

const AGENT_DATE_FILTER_KEY = 'agentStatsDate';
const AGENT_STATUS_FILTER_KEY = 'agentStatus';

const AGENT_STATUS_OPTIONS = ['Idle', 'InUse', 'Ringing', 'Paused'];

export const CallDetailPage = ({
  backPath = '/frontline/calls/dashboard',
}: {
  backPath?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { id } = useParams();
  const [updatedAt, setUpdatedAt] = useState<Date | undefined>(undefined);
  const { callUserIntegrations, loading: loadingUserIntegrations } =
    useCallUserIntegration();

  const { inboxId } =
    callUserIntegrations?.find((integration) =>
      integration.queues?.includes(id || ''),
    ) || {};

  const { callQueueInitialList, loading: loadingQueueInitialCallList } =
    useCallQueueInitialList({
      integrationId: inboxId || '',
      queue: id || '',
      setUpdatedAt,
    });

  const [agentStatsDateQuery, setAgentStatsDateQuery] =
    useFilterQueryState<string>(AGENT_DATE_FILTER_KEY);

  useEffect(() => {
    if (!agentStatsDateQuery) setAgentStatsDateQuery('today');
  }, [agentStatsDateQuery, setAgentStatsDateQuery]);

  const { fromDate: agentStatsFromDate, toDate: agentStatsToDate } = useMemo(
    () => getDateRange(agentStatsDateQuery || 'today'),
    [agentStatsDateQuery],
  );

  const { agentDailyStats, loading: loadingAgentDailyStats } =
    useCallAgentDailyStats({
      integrationId: inboxId || '',
      queue: id || '',
      startDate: agentStatsFromDate?.toISOString(),
      endDate: agentStatsToDate?.toISOString(),
    });

  const { data } = useSubscription(QUEUE_REALTIME_UPDATE, {
    variables: {
      extension: id,
    },
    skip: !id,
    onData: () => {
      setUpdatedAt(new Date());
    },
  });

  const callRealtimeUpdate: Partial<ICallQueueRealtimeSnapshot> = JSON.parse(
    data?.queueRealtimeUpdate || '{}',
  );

  const membersList =
    callRealtimeUpdate.agents || callQueueInitialList?.agents || [];

  const waitingCallList =
    callRealtimeUpdate.waiting || callQueueInitialList?.waiting || [];
  const talkingCallList =
    callRealtimeUpdate.talking || callQueueInitialList?.talking || [];

  if (loadingUserIntegrations || loadingQueueInitialCallList) {
    return <Spinner size="md" />;
  }

  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    backPath.includes('/statistics')
      ? t('calls-statistics')
      : t('calls-dashboard'),
    id,
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/calls/dashboard">
                    <IconPhone />
                    {t('calls-dashboard')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/calls/statistics">
                    <IconPhone />
                    {t('calls-statistics')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button
                  variant="ghost"
                  className="hover:bg-transparent cursor-default"
                >
                  {id}
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="ml-1">
                <PageHeader.FavoriteToggleButton
                  breadcrumb={favoriteBreadcrumb}
                  icon="IconPhone"
                />
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <div className="flex flex-col flex-auto overflow-hidden p-5 gap-5">
        <div>
          <Button variant="ghost" asChild className="px-2 gap-1">
            <Link to={backPath}>
              <IconChevronLeft />
              {t('go-back-to-queues')}
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <CallDetailCard
            title={t('total-agents')}
            description={t('total-agents')}
            value={membersList?.length}
            date={updatedAt?.toISOString()}
          />
          <CallDetailCard
            title={t('available-agents')}
            description={t('available-agents')}
            value={
              membersList?.filter((extension) => extension.status === 'Idle')
                .length
            }
            date={updatedAt?.toISOString()}
          />
          <CallDetailCard
            title={t('active-calls')}
            description={t('active-calls')}
            value={
              callRealtimeUpdate?.talking?.length ||
              membersList?.filter((extension) => extension.status === 'InUse')
                .length ||
              0
            }
            date={updatedAt?.toISOString()}
          />
          <CallDetailCard
            title={t('waiting-calls')}
            description={t('waiting-calls')}
            value={
              callRealtimeUpdate?.waiting?.length ||
              membersList?.filter((extension) => extension.status === 'Waiting')
                .length ||
              0
            }
            date={updatedAt?.toISOString()}
          />
        </div>
        <div className="flex flex-1 min-h-0 flex-col gap-5">
          <CallDetailAgents
            agentDailyStats={agentDailyStats}
            loading={loadingAgentDailyStats}
          />
          <div className="grid grid-cols-2 gap-5 h-72 shrink-0">
            <CallDetailWaiting waitingList={waitingCallList || []} />
            <CallDetailTalking talkingList={talkingCallList || []} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export const CallDetailAgents = ({
  agentDailyStats,
  loading,
}: {
  agentDailyStats: ICallAgentDailyStat[];
  loading?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [search, setSearch] = useState('');
  const [statusFilter] = useFilterQueryState<string>(AGENT_STATUS_FILTER_KEY);

  const filteredStats = agentDailyStats
    .filter((row) =>
      [row.firstName, row.lastName, row.extension]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((row) => !statusFilter || row.status === statusFilter);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <h5 className="font-mono text-xs uppercase font-semibold">
        {t('agents')}
      </h5>
      <Filter id="call-detail-agents-date-filter">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <IconSearch className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-accent-foreground" />
            <Input
              placeholder={t('search')}
              value={search}
              className="pl-8 relative bg-transparent"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium shrink-0">
            <Filter.BarName>
              <IconCalendar className="h-3.5 w-3.5" />
              {t('date')}
            </Filter.BarName>
            <Filter.Date filterKey={AGENT_DATE_FILTER_KEY} label={t('date')} />
          </div>
          <AgentStatusFilter />
          <div className="ml-auto text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
            {isUndefinedOrNull(agentDailyStats) || loading ? (
              <Skeleton className="w-20 h-4 inline-block mt-1.5" />
            ) : (
              t('records-found', { count: filteredStats.length })
            )}
          </div>
        </div>
        <Filter.Dialog>
          <Filter.View filterKey={AGENT_DATE_FILTER_KEY} inDialog>
            <Filter.DialogDateView
              filterKey={AGENT_DATE_FILTER_KEY}
              label={t('date')}
            />
          </Filter.View>
        </Filter.Dialog>
      </Filter>
      <RecordTable.Provider
        columns={useAgentColumns()}
        data={filteredStats}
        tableId="frontline_call_agents_record_table"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header showColumnSelector />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
      {loading && !agentDailyStats.length && (
        <div className="flex items-center justify-center py-6">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
};

function AgentStatusFilter() {
  const { t } = useTranslation('frontline');
  const [status, setStatus] = useFilterQueryState<string>(
    AGENT_STATUS_FILTER_KEY,
  );
  const selected = status || null;

  return (
    <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium shrink-0">
      <Filter.BarName>{t('status')}</Filter.BarName>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1.5 px-2 bg-background hover:bg-muted-foreground/10 transition-colors rounded-r">
            {selected ?? t('all-statuses', { defaultValue: 'All statuses' })}
            <IconChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" className="w-40">
          <DropdownMenu.Item
            onSelect={() => setStatus(null)}
            className={!selected ? 'text-primary' : ''}
          >
            {t('all-statuses', { defaultValue: 'All statuses' })}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          {AGENT_STATUS_OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option}
              onSelect={() => setStatus(option)}
              className={selected === option ? 'text-primary' : ''}
            >
              {option}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}

function useLivePausedMinutes(startDate: Date | null): string {
  const [label, setLabel] = useState(() =>
    startDate
      ? formatDurationShort(differenceInSeconds(new Date(), startDate))
      : '0m',
  );

  useEffect(() => {
    if (!startDate) {
      setLabel('0m');
      return;
    }

    const update = () =>
      setLabel(
        formatDurationShort(
          Math.max(0, differenceInSeconds(new Date(), startDate)),
        ),
      );

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return label;
}

function PauseCell({ row }: { row: ICallAgentDailyStat }) {
  const { t } = useTranslation('frontline');
  const ongoingStart = useMemo(
    () =>
      row.currentPauseStartedAt ? new Date(row.currentPauseStartedAt) : null,
    [row.currentPauseStartedAt],
  );
  const ongoingDuration = useLivePausedMinutes(ongoingStart);

  if (ongoingStart) {
    return (
      <RecordTableInlineCell>
        <Badge variant="warning">{ongoingDuration}</Badge>
        <span className="text-xs text-muted-foreground">
          {safeFormatDate(row.currentPauseStartedAt)}
        </span>
      </RecordTableInlineCell>
    );
  }

  if (!row.totalPausedSec) {
    return (
      <RecordTableInlineCell className="text-muted-foreground">
        —
      </RecordTableInlineCell>
    );
  }

  const lastInterval = row.pauseIntervals[row.pauseIntervals.length - 1];

  return (
    <RecordTableInlineCell
      title={
        row.pauseIntervals.length > 1
          ? t('n-pauses', {
              count: row.pauseIntervals.length,
              defaultValue: `${row.pauseIntervals.length} pauses`,
            })
          : undefined
      }
    >
      <span className="font-medium">
        {formatDurationShort(row.totalPausedSec)}
      </span>
      {lastInterval && (
        <span className="text-xs text-muted-foreground">
          {safeFormatDate(lastInterval.start)}
        </span>
      )}
    </RecordTableInlineCell>
  );
}

export const useAgentColumns = (): ColumnDef<ICallAgentDailyStat>[] => {
  const { t } = useTranslation('frontline');
  return [
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead label={t('status')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <Badge
            variant={
              cell.getValue() === 'Idle'
                ? 'success'
                : ['Ringing', 'InUse'].includes(cell.getValue() as string)
                  ? 'warning'
                  : cell.getValue() === 'Paused'
                    ? 'destructive'
                    : 'secondary'
            }
          >
            {(cell.getValue() as string) || '-'}
          </Badge>
        </RecordTableInlineCell>
      ),
      size: 90,
    },
    {
      id: 'extension',
      accessorKey: 'extension',
      header: () => <RecordTable.InlineHead label={t('extension')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-mono">
          <Badge variant="secondary">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      ),
      size: 90,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label={t('name')} />,
      cell: ({ cell }) => {
        const { firstName, lastName } = cell.row.original;
        return (
          <RecordTableInlineCell className="font-medium">
            {firstName} {lastName}
          </RecordTableInlineCell>
        );
      },
      size: 170,
    },
    {
      id: 'answer',
      accessorKey: 'answer',
      header: () => <RecordTable.InlineHead label={t('answered')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      ),
      size: 80,
    },
    {
      id: 'abandon',
      accessorKey: 'abandon',
      header: () => <RecordTable.InlineHead label={t('abandoned')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      ),
      size: 80,
    },
    {
      id: 'talktime',
      accessorKey: 'talktime',
      header: () => <RecordTable.InlineHead label={t('talk-time')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatSeconds(cell.getValue() as number)}
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: () => <RecordTable.InlineHead label={t('date')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatDateKey(cell.getValue() as string)}
        </RecordTableInlineCell>
      ),
      size: 90,
    },
    {
      id: 'pause',
      accessorKey: 'totalPausedSec',
      header: () => <RecordTable.InlineHead label={t('pause')} />,
      cell: ({ row }) => <PauseCell row={row.original} />,
      size: 160,
    },
  ];
};

function formatDateKey(dateKey: string): string {
  if (!dateKey) return '-';
  const [, month, day] = dateKey.split('-');
  return month && day ? `${month}-${day}` : dateKey;
}

export const CallDetailCard = ({
  description,
  value,
  title,
  date,
}: {
  description: string;
  value?: number;
  title: string;
  date?: string;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="bg-accent rounded-xl p-1">
      <div className="flex items-center justify-between px-2 h-7">
        <h4 className="text-xs font-medium font-mono uppercase">{title}</h4>
        <Collapsible>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-6"
            >
              <IconInfoCircle />
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>{description}</Collapsible.Content>
        </Collapsible>
      </div>
      <div className="bg-background rounded-lg px-3 py-2 shadow-sm space-y-2">
        <h3 className="font-semibold text-2xl leading-none">{value}</h3>
        <Separator />
        <div className="text-accent-foreground text-xs leading-none">
          {t('updated')} {date && <RelativeDateDisplay.Value value={date} />}
        </div>
      </div>
    </div>
  );
};

type WaitingCall = {
  callerid: string;
  callerchannel?: string;
};

export const useWaitingColumns = (): ColumnDef<WaitingCall>[] => {
  const { t } = useTranslation('frontline');

  return [
    {
      accessorKey: 'callerid',
      header: () => <RecordTable.InlineHead label={t('caller-id')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatPhoneNumber({
            defaultCountry: 'MN',
            value: cell.getValue() as string,
          })}
        </RecordTableInlineCell>
      ),
    },
    {
      accessorKey: 'callerchannel',
      header: () => <RecordTable.InlineHead label={t('caller-channel')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
      size: 300,
    },
  ];
};

export const CallDetailWaiting = ({
  waitingList,
}: {
  waitingList: WaitingCall[];
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex flex-col gap-3">
      <h5 className="font-mono text-xs uppercase font-semibold">
        {t('waiting')}
      </h5>
      <RecordTable.Provider columns={useWaitingColumns()} data={waitingList}>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
};

type TalkingCall = {
  callerid: string;
  calleeid?: string;
  bridge_time?: string | Date;
};

function TalkingCallDurationCell({
  value,
}: Readonly<{ value?: string | Date }>) {
  const startDate = useMemo(() => {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [value]);
  const duration = useCallDurationFromDate(startDate);

  return (
    <RecordTableInlineCell className="font-medium">
      {startDate ? duration : '-'}
    </RecordTableInlineCell>
  );
}

export const useTalkingColumns = (): ColumnDef<TalkingCall>[] => {
  const { t } = useTranslation('frontline');

  return [
    {
      accessorKey: 'callerid',
      header: () => <RecordTable.InlineHead label={t('caller-id')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatPhoneNumber({
            defaultCountry: 'MN',
            value: cell.getValue() as string,
          })}
        </RecordTableInlineCell>
      ),
    },
    {
      accessorKey: 'calleeid',
      header: () => <RecordTable.InlineHead label={t('caller-channel')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      accessorKey: 'bridge_time',
      header: () => <RecordTable.InlineHead label={t('duration')} />,
      cell: ({ cell }) => (
        <TalkingCallDurationCell
          value={cell.getValue() as string | Date | undefined}
        />
      ),
    },
  ];
};

export const CallDetailTalking = ({
  talkingList,
}: {
  talkingList: TalkingCall[];
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex flex-col gap-3">
      <h5 className="font-mono text-xs uppercase font-semibold">
        {t('talking')}
      </h5>
      <RecordTable.Provider columns={useTalkingColumns()} data={talkingList}>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
};
