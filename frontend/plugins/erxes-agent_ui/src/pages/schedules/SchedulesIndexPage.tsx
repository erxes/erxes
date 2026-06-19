import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconPlus,
  IconAlignLeft,
  IconCalendarTime,
  IconClock,
  IconHistory,
  IconMessageCircle,
  IconPencil,
  IconPlayerPlay,
  IconRobot,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Combobox,
  Command,
  Empty,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Separator,
  Tooltip,
  toast,
  useConfirm,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  MASTRA_SCHEDULE_REMOVE,
  MASTRA_SCHEDULE_RUN_NOW,
  MASTRA_SCHEDULE_SET_ENABLED,
} from '~/graphql/mutations';
import {
  ToggleDeleteMenuItems,
  enabledStatusColumn,
} from '~/components/RecordTableShared';
import { useSchedules } from './hooks/useSchedules';
import { ISchedule, IScheduleRunNowResponse } from './types';

// ─── More menu cell ───────────────────────────────────────────────────────────

/** Row actions: run now, view output thread, edit, enable/disable, delete. */
const ScheduleMoreCell = ({
  schedule,
  refetch,
}: {
  schedule: ISchedule;
  refetch: () => void;
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [removeSchedule] = useMutation(MASTRA_SCHEDULE_REMOVE, {
    onCompleted: () => refetch(),
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const [setEnabled] = useMutation(MASTRA_SCHEDULE_SET_ENABLED, {
    onCompleted: () => refetch(),
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const [runNow, { loading: running }] = useMutation<IScheduleRunNowResponse>(
    MASTRA_SCHEDULE_RUN_NOW,
    {
      onCompleted: (data) => {
        const outcome = data?.mastraScheduleRunNow;
        if (outcome?.lastStatus === 'failed') {
          toast({
            title: 'Run failed',
            description: outcome.lastError || schedule.name,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Run finished', description: schedule.name });
        }
        refetch();
      },
      onError: (e) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
    },
  );

  /** Confirm, then remove the schedule together with its output thread. */
  const handleDelete = () =>
    confirm({
      message: `Remove "${schedule.name}" and its output thread? This cannot be undone.`,
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => removeSchedule({ variables: { _id: schedule._id } }));

  return (
    // skipcq: JS-0415 — action menu scaffolding nests past the lint cap
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        side="right"
        align="start"
        avoidCollisions={false}
        className="w-44 min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                disabled={running}
                onClick={() => {
                  toast({ title: 'Running…', description: schedule.name });
                  runNow({ variables: { _id: schedule._id } });
                }}
              >
                <IconPlayerPlay className="size-4" /> Run now
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                disabled={!schedule.lastRunAt}
                title={
                  schedule.lastRunAt
                    ? undefined
                    : 'No output yet — the thread is created on the first run'
                }
                onClick={() =>
                  navigate(
                    `/erxes-agent/chat/${schedule.agentId}?thread=${schedule.threadId}`,
                  )
                }
              >
                <IconMessageCircle className="size-4" /> View output
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={() =>
                  navigate(`/erxes-agent/schedules/edit/${schedule._id}`)
                }
              >
                <IconPencil className="size-4" /> Edit
              </Button>
            </Command.Item>
            <ToggleDeleteMenuItems
              isEnabled={schedule.isEnabled}
              onToggle={() =>
                setEnabled({
                  variables: {
                    _id: schedule._id,
                    isEnabled: !schedule.isEnabled,
                  },
                })
              }
              onDelete={handleDelete}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Columns ──────────────────────────────────────────────────────────────────

/** Badge variant per run status — skipped is neutral, not a green success. */
const STATUS_VARIANTS = {
  failed: 'destructive',
  skipped: 'secondary',
  success: 'success',
} as const;

/** Status badge (with error tooltip on failure) plus relative run time. */
const LastRunCell = ({ schedule }: { schedule: ISchedule }) => {
  if (!schedule.lastRunAt) {
    return (
      <RecordTableInlineCell>
        <span className="text-xs text-muted-foreground">Never</span>
      </RecordTableInlineCell>
    );
  }
  const failed = schedule.lastStatus === 'failed';
  const badge = (
    <Badge variant={STATUS_VARIANTS[schedule.lastStatus ?? 'success']}>
      {schedule.lastStatus}
    </Badge>
  );
  return (
    <RecordTableInlineCell>
      <div className="flex items-center gap-2">
        {failed && schedule.lastError ? (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>{badge}</Tooltip.Trigger>
              <Tooltip.Content className="max-w-sm break-words">
                {schedule.lastError}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        ) : (
          badge
        )}
        <RelativeDateDisplay value={schedule.lastRunAt} asChild>
          <span className="text-xs text-muted-foreground">
            <RelativeDateDisplay.Value value={schedule.lastRunAt} />
          </span>
        </RelativeDateDisplay>
      </div>
    </RecordTableInlineCell>
  );
};

const baseColumns: ColumnDef<ISchedule>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconAlignLeft} label="Schedule" />
    ),
    cell: ({ row }) => {
      const { _id, name, description } = row.original;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/erxes-agent/schedules/edit/${_id}`}
            className="font-medium hover:underline cursor-pointer"
          >
            {name}
          </Link>
          {description && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              {description}
            </div>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 260,
  },
  {
    id: 'agent',
    accessorKey: 'agentId',
    header: () => <RecordTable.InlineHead icon={IconRobot} label="Agent" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary" className="font-mono">
          {cell.getValue() as string}
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'cron',
    accessorKey: 'cron',
    header: () => <RecordTable.InlineHead icon={IconClock} label="Cron" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <span className="font-mono text-xs">{row.original.cron}</span>
        {row.original.timezone && row.original.timezone !== 'UTC' && (
          <span className="text-[10px] text-muted-foreground ml-1.5">
            {row.original.timezone}
          </span>
        )}
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  enabledStatusColumn<ISchedule>(),
  {
    id: 'lastRun',
    header: () => (
      <RecordTable.InlineHead icon={IconHistory} label="Last run" />
    ),
    cell: ({ row }) => <LastRunCell schedule={row.original} />,
    size: 180,
  },
  {
    id: 'runCount',
    accessorKey: 'runCount',
    header: () => <RecordTable.InlineHead icon={IconPlayerPlay} label="Runs" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="text-sm tabular-nums">
          {(cell.getValue() as number) || 0}
        </span>
      </RecordTableInlineCell>
    ),
    size: 70,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

/** The full column set, with the actions column bound to this list's refetch. */
const buildColumns = (refetch: () => void): ColumnDef<ISchedule>[] => [
  {
    id: 'more',
    cell: ({ row }) => (
      <ScheduleMoreCell schedule={row.original} refetch={refetch} />
    ),
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<ISchedule>,
  ...baseColumns,
];

/** Record table of all agent schedules with row actions. */
export const SchedulesIndexPage = () => {
  const { schedules, loading, refetch } = useSchedules();

  const columns = useMemo(() => buildColumns(refetch), [refetch]);

  return (
    // skipcq: JS-0415 — page scaffolding (header/empty state/table) nests past the cap
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/erxes-agent/schedules">
                    <IconCalendarTime />
                    Schedules
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button asChild>
            <Link to="/erxes-agent/schedules/new">
              <IconPlus /> New Schedule
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      {!loading && schedules.length === 0 ? (
        // skipcq: JS-0415 — empty-state scaffolding nests past the lint cap
        <div className="flex-1 flex items-center justify-center p-4">
          <Empty className="border border-dashed max-w-sm w-full">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconCalendarTime />
              </Empty.Media>
              <Empty.Title>No schedules yet</Empty.Title>
              <Empty.Description>
                Run an agent on a recurring cron — daily reports, periodic
                checks, reminders.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button asChild>
                <Link to="/erxes-agent/schedules/new">
                  <IconPlus /> Create Schedule
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        </div>
      ) : (
        // skipcq: JS-0415 — record-table scaffolding nests past the lint cap
        <div className="flex-1 min-h-0">
          <RecordTable.Provider
            columns={columns}
            data={schedules}
            className="m-3"
            stickyColumns={['more', 'checkbox', 'name']}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={false}
              hasNextPage={false}
              loading={loading}
              dataLength={schedules.length}
              sessionKey="erxes_agent_schedules"
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {loading && schedules.length === 0 ? (
                    <RecordTable.RowSkeleton rows={10} />
                  ) : (
                    <RecordTable.RowList />
                  )}
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.CursorProvider>
          </RecordTable.Provider>
        </div>
      )}
    </div>
  );
};
