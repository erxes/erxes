import {
  IconChevronLeft,
  IconInfoCircle,
  IconPhone,
  IconSearch,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Breadcrumb,
  Button,
  Collapsible,
  Badge,
  PageContainer,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Separator,
  Input,
  Spinner,
  formatPhoneNumber,
} from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import {
  CallQueueMemberList,
  useCallQueueMemberList,
} from '@/integrations/call/hooks/useCallQueueMemberList';
import { useState } from 'react';
import {
  formatSeconds,
  safeFormatDate,
} from '@/integrations/call/utils/callUtils';
import { QUEUE_REALTIME_UPDATE } from '@/integrations/call/graphql/subscriptions/subscriptions';
import { useSubscription } from '@apollo/client';
import { useCallDurationFromDate } from '@/integrations/call/hooks/useCallDuration';
import { useCallQueueInitialList } from '@/integrations/call/hooks/useCallQueueInitialList';

export const CallDetailPage = () => {
  const { id } = useParams();
  const [updatedAt, setUpdatedAt] = useState<Date | undefined>(undefined);
  const { callUserIntegrations, loading: loadingUserIntegrations } =
    useCallUserIntegration();

  const { inboxId } =
    callUserIntegrations?.find((integration) =>
      integration.queues?.includes(id || ''),
    ) || {};

  const { callQueueMemberList, loading: loadingQueueMemberList } =
    useCallQueueMemberList({
      integrationId: inboxId || '',
      queue: id || '',
      setUpdatedAt,
    });

  const { callQueueInitialList, loading: loadingQueueInitialCallList } =
    useCallQueueInitialList({
      integrationId: inboxId || '',
      queue: id || '',
      setUpdatedAt,
    });

  const { data } = useSubscription(QUEUE_REALTIME_UPDATE, {
    variables: {
      extension: id,
    },
    skip: !id,
    onData: ({ data }) => {
      const { queueRealtimeUpdate } = data?.data || {};
      setUpdatedAt(new Date());
      JSON.parse(queueRealtimeUpdate);
    },
  });

  const callRealtimeUpdate = JSON.parse(data?.queueRealtimeUpdate || '{}');

  const membersList = callQueueMemberList?.member?.map((member) => {
    const memberRealTimeUpdate =
      callRealtimeUpdate.agents?.find(
        (agent: any) => agent.member_extension === member.member_extension,
      ) || {};
    return {
      ...member,
      status: memberRealTimeUpdate.status || member.status,
      answer: memberRealTimeUpdate.answer || member.answer,
      abandon: memberRealTimeUpdate.abandon || member.abandon,
      talktime: memberRealTimeUpdate.talktime || member.talktime,
      pausetime: memberRealTimeUpdate.pausetime || member.pausetime,
      queue_action: memberRealTimeUpdate.queue_action,
    };
  });

  const waitingCallList =
    callRealtimeUpdate.waiting || callQueueInitialList?.waiting || [];
  const talkingCallList =
    callRealtimeUpdate.talking || callQueueInitialList?.talking || [];

  if (
    loadingUserIntegrations ||
    loadingQueueMemberList ||
    loadingQueueInitialCallList
  ) {
    return <Spinner size="md" />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link asChild>
                  <Button variant="ghost" asChild>
                    <Link to="/frontline/calls">
                      <IconPhone />
                      Calls
                    </Link>
                  </Button>
                </Breadcrumb.Link>
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
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <div className="flex flex-col flex-auto overflow-hidden p-5 gap-5">
        <div>
          <Button variant="ghost" asChild className="px-2 gap-1">
            <Link to="/frontline/calls">
              <IconChevronLeft />
              Go back to queues
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <CallDetailCard
            title="total agents"
            description="Total agents"
            value={membersList?.length}
            date={updatedAt?.toISOString()}
          />
          <CallDetailCard
            title="available agents"
            description="available agents"
            value={
              membersList?.filter((extension) => extension.status === 'Idle')
                .length
            }
            date={updatedAt?.toISOString()}
          />
          <CallDetailCard
            title="Active calls"
            description="Active calls"
            value={
              callRealtimeUpdate?.talking?.length ||
              membersList?.filter((extension) => extension.status === 'InUse')
                .length ||
              0
            }
            date={updatedAt?.toISOString()}
          />
          <CallDetailCard
            title="Waiting calls"
            description="Waiting calls"
            value={
              callRealtimeUpdate?.waiting?.length ||
              membersList?.filter((extension) => extension.status === 'Waiting')
                .length ||
              0
            }
            date={updatedAt?.toISOString()}
          />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 flex-1 gap-5">
          <CallDetailAgents membersList={membersList || []} />
          <CallDetailWaiting waitingList={waitingCallList || []} />
          <CallDetailTalking talkingList={talkingCallList || []} />
        </div>
      </div>
    </PageContainer>
  );
};

export const CallDetailAgents = ({
  membersList,
}: {
  membersList: CallQueueMemberList['member'];
}) => {
  const [search, setSearch] = useState('');

  const filteredMembersList = membersList.filter((member) =>
    [member.first_name, member.last_name, member.member_extension]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="row-span-2 flex flex-col gap-3">
      <h5 className="font-mono text-xs uppercase font-semibold">Agents</h5>
      <div className="relative">
        <IconSearch className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-accent-foreground" />
        <Input
          placeholder="Search"
          value={search}
          className="pl-8 relative bg-transparent"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <RecordTable.Provider columns={agentColumns} data={filteredMembersList}>
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

export const agentColumns: ColumnDef<CallQueueMemberList['member'][number]>[] =
  [
    {
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead label="Status" />,
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
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      accessorKey: 'member_extension',
      header: () => <RecordTable.InlineHead label="Extention" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-mono">
          <Badge variant="secondary">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      ),
      size: 100,
    },

    {
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label="Name" />,
      cell: ({ cell }) => {
        const { first_name, last_name } = cell.row.original;
        return (
          <RecordTableInlineCell className="font-medium">
            {first_name} {last_name}
          </RecordTableInlineCell>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'answer',
      header: () => <RecordTable.InlineHead label="Answered" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      accessorKey: 'abandon',
      header: () => <RecordTable.InlineHead label="Abandoned" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      accessorKey: 'talktime',
      header: () => <RecordTable.InlineHead label="Talk Time" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatSeconds(cell.getValue() as number)}
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      accessorKey: 'pausetime',
      header: () => <RecordTable.InlineHead label="Pause Time" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {safeFormatDate(cell?.getValue())}
        </RecordTableInlineCell>
      ),
      size: 200,
    },
  ];

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
          updated {date && <RelativeDateDisplay.Value value={date} />}
        </div>
      </div>
    </div>
  );
};

export const CallDetailWaiting = ({
  waitingList,
}: {
  waitingList: { callerid: string; callerchannel: string }[];
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h5 className="font-mono text-xs uppercase font-semibold">Waiting</h5>
      <RecordTable.Provider
        columns={[
          {
            accessorKey: 'callerid',
            header: () => <RecordTable.InlineHead label="Caller ID" />,
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
            header: () => <RecordTable.InlineHead label="Caller Channel" />,
            cell: ({ cell }) => (
              <RecordTableInlineCell className="font-medium">
                {cell.getValue() as string}
              </RecordTableInlineCell>
            ),
            size: 300,
          },
        ]}
        data={waitingList}
      >
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

export const CallDetailTalking = ({
  talkingList,
}: {
  talkingList: {
    callerid: string;
  }[];
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h5 className="font-mono text-xs uppercase font-semibold">Talking</h5>
      <RecordTable.Provider
        columns={[
          {
            accessorKey: 'callerid',
            header: () => <RecordTable.InlineHead label="Caller ID" />,
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
            header: () => <RecordTable.InlineHead label="Caller Channel" />,
            cell: ({ cell }) => (
              <RecordTableInlineCell className="font-medium">
                {cell.getValue() as string}
              </RecordTableInlineCell>
            ),
          },
          {
            accessorKey: 'bridge_time',
            header: () => <RecordTable.InlineHead label="Duration" />,
            cell: ({ cell }) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const duration = useCallDurationFromDate(cell.getValue() as Date);
              return (
                <RecordTableInlineCell className="font-medium">
                  {duration}
                </RecordTableInlineCell>
              );
            },
          },
        ]}
        data={talkingList}
      >
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
