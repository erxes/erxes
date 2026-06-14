import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconPlus,
  IconSitemap,
  IconAlignLeft,
  IconBolt,
  IconCalendar,
  IconListNumbers,
  IconPencil,
  IconPlayerPlay,
  IconEye,
  IconVersions,
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
  toast,
  useConfirm,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_WORKFLOWS } from '~/graphql/queries';
import {
  MASTRA_WORKFLOW_REMOVE,
  MASTRA_WORKFLOW_RUN_START,
  MASTRA_WORKFLOW_SET_ENABLED,
} from '~/graphql/mutations';
import {
  ToggleDeleteMenuItems,
  enabledStatusColumn,
} from '~/components/RecordTableShared';
import { stepCount, triggerLabel } from './shared';

export interface IWorkflowRow {
  _id: string;
  name: string;
  description?: string;
  definition: any;
  version: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── More menu cell ───────────────────────────────────────────────────────────

const WorkflowMoreCell = ({
  workflow,
  refetch,
}: {
  workflow: IWorkflowRow;
  refetch: () => void;
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [removeWorkflow] = useMutation(MASTRA_WORKFLOW_REMOVE, {
    onCompleted: () => refetch(),
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const [setEnabled] = useMutation(MASTRA_WORKFLOW_SET_ENABLED, {
    onCompleted: () => refetch(),
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const [runStart] = useMutation(MASTRA_WORKFLOW_RUN_START, {
    onCompleted: () => {
      toast({ title: 'Run started', description: workflow.name });
      navigate(`/erxes-agent/workflows/${workflow._id}`);
    },
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleDelete = () =>
    confirm({
      message: `Remove "${workflow.name}" and all its run history? This cannot be undone.`,
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => removeWorkflow({ variables: { _id: workflow._id } }));

  return (
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
                onClick={() =>
                  navigate(`/erxes-agent/workflows/${workflow._id}`)
                }
              >
                <IconEye className="size-4" /> View runs
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={() =>
                  runStart({ variables: { _id: workflow._id, input: {} } })
                }
              >
                <IconPlayerPlay className="size-4" /> Run now
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={() =>
                  navigate(`/erxes-agent/workflows/edit/${workflow._id}`)
                }
              >
                <IconPencil className="size-4" /> Edit
              </Button>
            </Command.Item>
            <ToggleDeleteMenuItems
              isEnabled={workflow.isEnabled}
              onToggle={() =>
                setEnabled({
                  variables: {
                    _id: workflow._id,
                    isEnabled: !workflow.isEnabled,
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

const baseColumns: ColumnDef<IWorkflowRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconAlignLeft} label="Workflow" />
    ),
    cell: ({ row }) => {
      const { _id, name, description } = row.original;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/erxes-agent/workflows/${_id}`}
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
    size: 280,
  },
  {
    id: 'trigger',
    header: () => <RecordTable.InlineHead icon={IconBolt} label="Trigger" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {triggerLabel(row.original.definition)}
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'steps',
    header: () => (
      <RecordTable.InlineHead icon={IconListNumbers} label="Steps" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <span className="text-sm">{stepCount(row.original.definition)}</span>
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'version',
    accessorKey: 'version',
    header: () => (
      <RecordTable.InlineHead icon={IconVersions} label="Version" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="font-mono text-xs">v{cell.getValue() as number}</span>
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  enabledStatusColumn<IWorkflowRow>(),
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
    size: 130,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const WorkflowsIndexPage = () => {
  const { data, loading, refetch } = useQuery(MASTRA_WORKFLOWS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const workflows: IWorkflowRow[] = data?.mastraWorkflows || [];

  const columns = useMemo<ColumnDef<IWorkflowRow>[]>(
    () => [
      {
        id: 'more',
        cell: ({ row }) => (
          <WorkflowMoreCell workflow={row.original} refetch={refetch} />
        ),
        size: 33,
      },
      RecordTable.checkboxColumn as ColumnDef<IWorkflowRow>,
      ...baseColumns,
    ],
    [refetch],
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/erxes-agent/workflows">
                    <IconSitemap />
                    Workflows
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
            <Link to="/erxes-agent/workflows/new">
              <IconPlus /> New Workflow
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      {!loading && workflows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Empty className="border border-dashed max-w-sm w-full">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconSitemap />
              </Empty.Media>
              <Empty.Title>No workflows yet</Empty.Title>
              <Empty.Description>
                Ask an agent to build one in Chat, or create one by hand.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button asChild>
                <Link to="/erxes-agent/workflows/new">
                  <IconPlus /> Create Workflow
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <RecordTable.Provider
            columns={columns}
            data={workflows}
            className="m-3"
            stickyColumns={['more', 'checkbox', 'name']}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={false}
              hasNextPage={false}
              loading={loading}
              dataLength={workflows.length}
              sessionKey="erxes_agent_workflows"
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {loading && workflows.length === 0 ? (
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
