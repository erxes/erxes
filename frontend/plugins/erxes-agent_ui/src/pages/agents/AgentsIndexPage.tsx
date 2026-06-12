import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconPlus,
  IconRobot,
  IconAlignLeft,
  IconCpu,
  IconTool,
  IconCalendar,
  IconPencil,
  IconMessageCircle,
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
  useConfirm,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_AGENTS } from '~/graphql/queries';
import { MASTRA_AGENT_REMOVE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import {
  ToggleDeleteMenuItems,
  enabledStatusColumn,
} from '~/components/RecordTableShared';
import { useMastraAgentList, IMastraAgentRow } from './useMastraAgentList';

type IAgent = IMastraAgentRow;

// ─── More menu cell ───────────────────────────────────────────────────────────

const AgentMoreCell = ({
  agent,
  refetch,
}: {
  agent: IAgent;
  refetch: () => void;
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // Keep the chat sidebar / other MASTRA_AGENTS consumers fresh, then refresh
  // this paginated list so the change shows without a manual reload.
  const [removeAgent] = useMutation(MASTRA_AGENT_REMOVE, {
    refetchQueries: [{ query: MASTRA_AGENTS }],
    onCompleted: () => refetch(),
  });

  const [updateAgent] = useMutation(MASTRA_AGENT_UPDATE, {
    refetchQueries: [{ query: MASTRA_AGENTS }],
    onCompleted: () => refetch(),
  });

  const handleDelete = () =>
    confirm({
      message: `Remove "${agent.name}"? This cannot be undone.`,
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => removeAgent({ variables: { _id: agent._id } }));

  const handleToggle = () =>
    updateAgent({
      variables: { _id: agent._id, doc: { isEnabled: !agent.isEnabled } },
    });

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
                onClick={() => navigate(`/erxes-agent/chat/${agent._id}`)}
              >
                <IconMessageCircle className="size-4" /> Chat
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={() =>
                  navigate(`/settings/erxes-agent/agents/edit/${agent._id}`)
                }
              >
                <IconPencil className="size-4" /> Edit
              </Button>
            </Command.Item>
            <ToggleDeleteMenuItems
              isEnabled={agent.isEnabled}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Static data columns (no refetch dependency) ──────────────────────────────

const baseColumns: ColumnDef<IAgent>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Agent" />,
    cell: ({ row }) => {
      const { _id, name, agentId, description } = row.original;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/erxes-agent/agents/edit/${_id}`}
            className="font-medium hover:underline cursor-pointer"
          >
            {name}
          </Link>
          <div className="font-mono text-xs text-muted-foreground">
            {agentId}
          </div>
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
    id: 'model',
    accessorKey: 'model',
    header: () => <RecordTable.InlineHead icon={IconCpu} label="Model" />,
    cell: ({ row }) => {
      const { provider, model } = row.original;
      return (
        <RecordTableInlineCell>
          <div className="text-xs text-muted-foreground">{provider}</div>
          <div className="font-mono text-xs">{model}</div>
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'tools',
    accessorKey: 'toolPolicy',
    header: () => (
      <RecordTable.InlineHead icon={IconTool} label="Tool access" />
    ),
    cell: ({ row }) => {
      const { toolPolicy, allowedTools } = row.original;
      const isRestricted = toolPolicy === 'custom';
      const count = allowedTools?.length ?? 0;
      return (
        <RecordTableInlineCell>
          {isRestricted ? (
            <Badge variant="secondary">
              {count > 0
                ? `${count} rule${count !== 1 ? 's' : ''}`
                : 'No tools'}
            </Badge>
          ) : (
            <Badge variant="success">All tools</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 110,
  },
  enabledStatusColumn<IAgent>(),
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created" />
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

export const AgentsIndexPage = () => {
  const { agentsList, loading, pageInfo, handleFetchMore, refetch } =
    useMastraAgentList();

  // The row actions (delete / enable-toggle) live in a column cell, so columns
  // close over refetch to refresh the list after a mutation.
  const columns = useMemo<ColumnDef<IAgent>[]>(
    () => [
      {
        id: 'more',
        cell: ({ row }) => (
          <AgentMoreCell agent={row.original} refetch={refetch} />
        ),
        size: 33,
      },
      RecordTable.checkboxColumn as ColumnDef<IAgent>,
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
                  <Link to="/settings/erxes-agent/agents">
                    <IconRobot />
                    Agents
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
            <Link to="/settings/erxes-agent/agents/new">
              <IconPlus /> New Agent
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      {!loading && agentsList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Empty className="border border-dashed max-w-sm w-full">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconRobot />
              </Empty.Media>
              <Empty.Title>No agents yet</Empty.Title>
              <Empty.Description>
                Create your first Mastra AI agent to get started.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button asChild>
                <Link to="/settings/erxes-agent/agents/new">
                  <IconPlus /> Create Agent
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <RecordTable.Provider
            columns={columns}
            data={agentsList}
            className="m-3"
            stickyColumns={['more', 'checkbox', 'name']}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={pageInfo.hasPreviousPage}
              hasNextPage={pageInfo.hasNextPage}
              loading={loading}
              dataLength={agentsList.length}
              sessionKey="erxes_agent_agents"
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.CursorBackwardSkeleton
                    handleFetchMore={handleFetchMore}
                  />
                  {loading && agentsList.length === 0 ? (
                    <RecordTable.RowSkeleton rows={20} />
                  ) : (
                    <RecordTable.RowList />
                  )}
                  <RecordTable.CursorForwardSkeleton
                    handleFetchMore={handleFetchMore}
                  />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.CursorProvider>
          </RecordTable.Provider>
        </div>
      )}
    </div>
  );
};
