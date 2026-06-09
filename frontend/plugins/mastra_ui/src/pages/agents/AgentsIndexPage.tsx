import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import {
  IconPlus,
  IconRobot,
  IconAlignLeft,
  IconCpu,
  IconTool,
  IconCalendar,
  IconPencil,
  IconTrash,
  IconMessageCircle,
  IconToggleLeft,
  IconToggleRight,
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface IAgent {
  _id: string;
  name: string;
  agentId: string;
  description?: string;
  provider: string;
  model: string;
  toolIds: string[];
  isEnabled: boolean;
  createdAt: string;
}

// ─── More menu cell ───────────────────────────────────────────────────────────

const AgentMoreCell = ({ row }: CellContext<IAgent, unknown>) => {
  const agent = row.original;
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [removeAgent] = useMutation(MASTRA_AGENT_REMOVE, {
    refetchQueries: [{ query: MASTRA_AGENTS }],
  });

  const [updateAgent] = useMutation(MASTRA_AGENT_UPDATE, {
    refetchQueries: [{ query: MASTRA_AGENTS }],
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
                onClick={() => navigate(`/mastra/chat/${agent._id}`)}
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
                  navigate(`/settings/mastra/agents/edit/${agent._id}`)
                }
              >
                <IconPencil className="size-4" /> Edit
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={handleToggle}
              >
                {agent.isEnabled ? (
                  <>
                    <IconToggleLeft className="size-4" /> Disable
                  </>
                ) : (
                  <>
                    <IconToggleRight className="size-4" /> Enable
                  </>
                )}
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8 text-destructive"
                onClick={handleDelete}
              >
                <IconTrash className="size-4" /> Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Column definitions ───────────────────────────────────────────────────────

const agentColumns: ColumnDef<IAgent>[] = [
  { id: 'more', cell: AgentMoreCell, size: 33 },
  RecordTable.checkboxColumn as ColumnDef<IAgent>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Agent" />,
    cell: ({ row }) => {
      const { _id, name, agentId, description } = row.original;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/mastra/agents/edit/${_id}`}
            className="font-medium hover:underline cursor-pointer"
          >
            {name}
          </Link>
          <div className="font-mono text-xs text-muted-foreground">{agentId}</div>
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
    accessorKey: 'toolIds',
    header: () => <RecordTable.InlineHead icon={IconTool} label="Tools" />,
    cell: ({ cell }) => {
      const toolIds = cell.getValue() as string[];
      return (
        <RecordTableInlineCell>
          {toolIds?.length > 0 ? (
            <Badge variant="secondary">
              {toolIds.length} tool{toolIds.length !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'status',
    accessorKey: 'isEnabled',
    header: () => (
      <RecordTable.InlineHead icon={IconToggleRight} label="Status" />
    ),
    cell: ({ cell }) => {
      const isEnabled = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={isEnabled ? 'success' : 'secondary'}>
            {isEnabled ? 'Active' : 'Disabled'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
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
  const { data, loading } = useQuery(MASTRA_AGENTS, {
    fetchPolicy: 'cache-and-network',
  });
  const agents: IAgent[] = data?.mastraAgents || [];

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/mastra/agents">
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
            <Link to="/settings/mastra/agents/new">
              <IconPlus /> New Agent
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      {!loading && agents.length === 0 ? (
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
                <Link to="/settings/mastra/agents/new">
                  <IconPlus /> Create Agent
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        </div>
      ) : (
        <RecordTable.Provider
          columns={agentColumns}
          data={agents}
          className="m-3"
          stickyColumns={['more', 'checkbox', 'name']}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={5} />}
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Provider>
      )}
    </div>
  );
};
